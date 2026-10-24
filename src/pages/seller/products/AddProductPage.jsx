import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, ImagePlus, Info, LoaderCircle, Plus, Trash2, Video, X } from "lucide-react";
import catalogService from "../../../services/catalogService";
import mediaService from "../../../services/mediaService";
import sellerService from "../../../services/sellerService";
import s from "./AddProductPage.module.css";

const SECTIONS = [
  ["basic", "Thông tin cơ bản"], ["details", "Thông tin chi tiết"], ["description", "Mô tả"],
  ["sales", "Thông tin bán hàng"], ["shipping", "Vận chuyển"], ["other", "Thông tin khác"]
];
const MAX_IMAGE_COUNT = 9;
const VIDEO_MAX_BYTES = 50 * 1024 * 1024;

const blankForm = () => ({
  itemName: "", gtin: "", description: "", imageRatio: "1:1", images: [], videoUrl: "",
  categoryId: "", attributes: {}, originalPrice: "", stock: "0", itemSku: "",
  weightGrams: "", length: "", width: "", height: "", shippingOptionIds: [],
  isPreorder: false, preorderDaysToShip: "5", condition: "NEW", termsAccepted: false
});

function categoryPath(categories, categoryId) {
  const byId = new Map(categories.map((category) => [String(category.category_id), category]));
  const path = [];
  let current = byId.get(String(categoryId));
  while (current) {
    path.unshift(current);
    current = byId.get(String(current.parent_category_id));
  }
  return path;
}

function variationCombinations(groups) {
  if (!groups.length || groups.some((group) => !group.name.trim() || !group.valuesText.split(",").map((value) => value.trim()).filter(Boolean).length)) return [];
  return groups.reduce((rows, group) => rows.flatMap((row) => group.valuesText.split(",").map((value) => value.trim()).filter(Boolean).map((option, index) => ({
    name: [...row.name, option], tierIndex: [...row.tierIndex, index]
  }))), [{ name: [], tierIndex: [] }]);
}

export default function AddProductPage({ shopId, onCancel, onSaved }) {
  const [form, setForm] = useState(blankForm);
  const [step, setStep] = useState("entry");
  const [activeSection, setActiveSection] = useState("basic");
  const [categories, setCategories] = useState([]);
  const [config, setConfig] = useState(null);
  const [categoryLevels, setCategoryLevels] = useState([]);
  const [variationGroups, setVariationGroups] = useState([]);
  const [modelValues, setModelValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [success, setSuccess] = useState("");
  const sectionViewportRef = useRef(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      catalogService.getCategories(),
      sellerService.getProductCreationConfig(shopId)
    ]).then(([categoryData, productConfig]) => {
      if (!alive) return;
      setCategories(categoryData);
      setConfig(productConfig);
      setLoading(false);
    }).catch((error) => {
      if (!alive) return;
      setNotice(error.message || "Không thể tải cấu hình đăng sản phẩm.");
      setLoading(false);
    });
    return () => { alive = false; };
  }, [shopId]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const selectedCategory = categories.find((category) => String(category.category_id) === String(form.categoryId));
  const selectedCategoryPath = useMemo(() => categoryPath(categories, form.categoryId), [categories, form.categoryId]);
  const activeAttributes = selectedCategory?.attributes || [];
  const combinations = useMemo(() => variationCombinations(variationGroups), [variationGroups]);
  const shippingOptions = config?.shipping_options || [];

  const selectSection = (sectionId) => {
    setActiveSection(sectionId);
    sectionViewportRef.current?.querySelector(`#section-${sectionId}`)?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const syncActiveSection = () => {
    const viewport = sectionViewportRef.current;
    if (!viewport) return;
    const viewportTop = viewport.getBoundingClientRect().top;
    let closest = SECTIONS[0][0];
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const [id] of SECTIONS) {
      const section = viewport.querySelector(`#section-${id}`);
      if (!section) continue;
      const distance = Math.abs(section.getBoundingClientRect().top - viewportTop - 12);
      if (distance < nearestDistance) { nearestDistance = distance; closest = id; }
    }
    setActiveSection(closest);
  };

  useEffect(() => {
    if (step !== "editor") return undefined;
    const viewport = sectionViewportRef.current;
    if (!viewport) return undefined;
    viewport.addEventListener("scroll", syncActiveSection, { passive: true });
    return () => viewport.removeEventListener("scroll", syncActiveSection);
  }, [step]);

  const categorySelects = () => {
    const selects = [];
    let parentId = 0;
    for (let depth = 0; depth < 4; depth += 1) {
      const children = categories.filter((category) => Number(category.parent_category_id) === Number(parentId));
      if (!children.length) break;
      const selectedId = categoryLevels[depth] || "";
      selects.push(
        <select key={depth} value={selectedId} aria-label={`Cấp ngành hàng ${depth + 1}`} onChange={(event) => {
          const nextId = event.target.value;
          const nextLevels = [...categoryLevels.slice(0, depth), nextId];
          const chosen = categories.find((category) => String(category.category_id) === String(nextId));
          setCategoryLevels(nextLevels);
          setForm((current) => ({ ...current, categoryId: chosen && !chosen.has_children ? nextId : "", attributes: {} }));
          setErrors((current) => ({ ...current, categoryId: "" }));
        }}>
          <option value="">Chọn ngành hàng</option>
          {children.map((category) => <option key={category.category_id} value={category.category_id}>{category.category_name}</option>)}
        </select>
      );
      const selected = categories.find((category) => String(category.category_id) === String(selectedId));
      if (!selected || !selected.has_children) break;
      parentId = selected.category_id;
    }
    return selects;
  };

  const uploadImages = async (files) => {
    const available = MAX_IMAGE_COUNT - form.images.length;
    const selected = Array.from(files).slice(0, available);
    if (selected.some((file) => !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type))) {
      setNotice("Chỉ hỗ trợ ảnh JPEG, PNG, WEBP hoặc GIF.");
      return;
    }
    if (!selected.length) return;
    setUploading(true);
    setNotice("");
    try {
      const uploaded = [];
      for (const file of selected) {
        const media = await mediaService.uploadMedia(file);
        uploaded.push({ url: media.url, fileId: media.file_id, name: file.name });
      }
      setForm((current) => ({ ...current, images: [...current.images, ...uploaded].slice(0, MAX_IMAGE_COUNT) }));
    } catch (error) {
      setNotice(error.message || "Tải ảnh lên chưa thành công. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const uploadVideo = async (file) => {
    if (!file) return;
    if (file.type !== "video/mp4") {
      setNotice("Video sản phẩm cần ở định dạng MP4.");
      return;
    }
    if (file.size > VIDEO_MAX_BYTES) {
      setNotice("Dung lượng video tối đa là 50 MB.");
      return;
    }
    setUploading(true);
    setNotice("");
    try {
      const media = await mediaService.uploadMedia(file);
      update("videoUrl", media.url);
    } catch (error) {
      setNotice(error.message || "Tải video lên chưa thành công. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const reorderImage = (index, offset) => setForm((current) => {
    const next = [...current.images];
    const destination = index + offset;
    if (destination < 0 || destination >= next.length) return current;
    [next[index], next[destination]] = [next[destination], next[index]];
    return { ...current, images: next };
  });

  const validate = (status) => {
    const next = {};
    if (!form.itemName.trim()) next.itemName = "Vui lòng nhập tên sản phẩm.";
    if (form.itemName.length > 120) next.itemName = "Tên sản phẩm không được vượt quá 120 ký tự.";
    if (!form.images.length) next.images = "Vui lòng tải lên ít nhất một hình ảnh sản phẩm.";
    if (!form.categoryId || selectedCategory?.has_children) next.categoryId = "Vui lòng chọn ngành hàng cuối cùng.";
    for (const attribute of activeAttributes.filter((item) => item.is_mandatory)) {
      if (!form.attributes[attribute.attribute_id]?.length) next[`attribute-${attribute.attribute_id}`] = `Vui lòng chọn ${attribute.name}.`;
    }
    if (!form.description.trim()) next.description = "Vui lòng nhập mô tả sản phẩm.";
    if (!Number(form.originalPrice) || Number(form.originalPrice) <= 0) next.originalPrice = "Giá sản phẩm phải lớn hơn 0.";
    if (variationGroups.some((group) => !group.name.trim() || !group.valuesText.split(",").map((value) => value.trim()).filter(Boolean).length)) {
      next.variationGroups = "Vui lòng nhập tên nhóm và ít nhất một giá trị cho mỗi nhóm phân loại.";
    }
    if (!form.weightGrams || Number(form.weightGrams) <= 0) next.weightGrams = "Vui lòng nhập cân nặng sau khi đóng gói.";
    if (!form.shippingOptionIds.length) next.shippingOptionIds = "Chọn ít nhất một phương thức vận chuyển.";
    const selectedOptions = shippingOptions.filter((option) => form.shippingOptionIds.includes(option.option_id));
    if (selectedOptions.some((option) => option.maximum_weight_gram != null && Number(form.weightGrams) > option.maximum_weight_gram)) {
      next.weightGrams = "Cân nặng vượt quá giới hạn của phương thức vận chuyển đã chọn.";
    }
    if (form.isPreorder && (!Number.isInteger(Number(form.preorderDaysToShip)) || Number(form.preorderDaysToShip) < 5 || Number(form.preorderDaysToShip) > 15)) {
      next.preorderDaysToShip = "Thời gian chuẩn bị hàng đặt trước phải từ 5 đến 15 ngày.";
    }
    if (!form.termsAccepted) next.termsAccepted = "Vui lòng đồng ý với Điều khoản và Điều kiện.";
    if (config?.is_vacation && status === "NORMAL") next.status = "Shop đang trong chế độ nghỉ lễ. Sản phẩm chỉ có thể lưu ở trạng thái ẩn.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleContinue = () => {
    const next = {};
    if (!form.itemName.trim()) next.itemName = "Vui lòng nhập tên sản phẩm.";
    if (form.itemName.length > 120) next.itemName = "Tên sản phẩm không được vượt quá 120 ký tự.";
    if (!form.images.length) next.images = "Vui lòng tải lên ít nhất một hình ảnh sản phẩm.";
    setErrors(next);
    if (!Object.keys(next).length) setStep("editor");
  };

  const handleCancel = () => {
    const changed = JSON.stringify(form) !== JSON.stringify(blankForm());
    if (changed && !window.confirm("Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời khỏi trang này không?")) return;
    onCancel();
  };

  const save = async (status) => {
    if (!validate(status)) {
      const missingRequiredAttribute = activeAttributes.some((attribute) => attribute.is_mandatory && !form.attributes[attribute.attribute_id]?.length);
      const firstSection = !form.itemName.trim() || !form.images.length || !form.categoryId ? "basic"
        : missingRequiredAttribute ? "details"
          : !form.description.trim() ? "description"
            : !Number(form.originalPrice) || Number(form.originalPrice) <= 0 || variationGroups.some((group) => !group.name.trim() || !group.valuesText.split(",").map((value) => value.trim()).filter(Boolean).length) ? "sales" : "shipping";
      setActiveSection(firstSection);
      return;
    }
    setSaving(true);
    setNotice("");
    setSuccess("");
    const models = combinations.length
      ? combinations.map((combination, index) => ({
        model_name: combination.name.join(", "),
        tier_index: combination.tierIndex,
        original_price: Number(modelValues[index]?.price || form.originalPrice),
        seller_stock: Number(modelValues[index]?.stock ?? form.stock),
        model_sku: modelValues[index]?.sku || ""
      }))
      : [{ model_name: "Standard", tier_index: [0], original_price: Number(form.originalPrice), seller_stock: Number(form.stock), model_sku: form.itemSku }];
    const attributeList = activeAttributes.filter((attribute) => form.attributes[attribute.attribute_id]?.length).map((attribute) => ({
      attribute_id: Number(attribute.attribute_id),
      attribute_value_list: form.attributes[attribute.attribute_id].map((value) => ({
        value_id: value.value_id ?? 0,
        original_value_name: value.original_value_name ?? ""
      }))
    }));
    try {
      const result = await sellerService.createProduct({
        product_workflow: true,
        shop_id: Number(shopId),
        category_id: Number(form.categoryId),
        item_name: form.itemName.trim(),
        description: form.description,
        original_price: Number(form.originalPrice),
        package_weight_grams: Number(form.weightGrams),
        weight: Number(form.weightGrams) / 1000,
        dimension: {
          package_length: Number(form.length || 0),
          package_width: Number(form.width || 0),
          package_height: Number(form.height || 0)
        },
        item_sku: form.itemSku,
        gtin: form.gtin,
        video_url: form.videoUrl,
        image_ratio: form.imageRatio,
        product_condition: form.condition,
        is_preorder: form.isPreorder,
        preorder_days_to_ship: form.isPreorder ? Number(form.preorderDaysToShip) : null,
        shipping_option_ids: form.shippingOptionIds,
        item_status: status,
        attribute_list: attributeList,
        image_url_list: form.images.map((image) => image.url),
        tier_variation: variationGroups.length ? variationGroups.map((group) => ({
          name: group.name,
          option_list: group.valuesText.split(",").map((option) => option.trim()).filter(Boolean).map((option) => ({ option }))
        })) : [],
        models
      });
      setSuccess(`Đã lưu sản phẩm ${result.item_id}.`);
      window.setTimeout(() => onSaved(status), 650);
    } catch (error) {
      setNotice(error.message || "Không thể lưu sản phẩm. Thông tin bạn nhập vẫn được giữ lại.");
    } finally {
      setSaving(false);
    }
  };

  const imageManager = () => (
    <div className={s.imageBlock}>
      <label className={s.label}>Hình ảnh sản phẩm <span className={s.required}>*</span></label>
      <div className={s.imageRow}>
        {form.images.map((image, index) => (
          <div className={s.imageTile} key={`${image.fileId}-${index}`}>
            <img src={image.url} alt={image.name} />
            {index === 0 && <span className={s.cover}>Ảnh bìa</span>}
            <div className={s.imageTools}>
              <button type="button" aria-label="Đưa ảnh lên trước" disabled={!index} onClick={() => reorderImage(index, -1)}><ArrowUp size={13} /></button>
              <button type="button" aria-label="Đưa ảnh xuống sau" disabled={index === form.images.length - 1} onClick={() => reorderImage(index, 1)}><ArrowDown size={13} /></button>
              <button type="button" aria-label="Xóa ảnh" onClick={() => update("images", form.images.filter((_, imageIndex) => imageIndex !== index))}><X size={13} /></button>
            </div>
          </div>
        ))}
        {form.images.length < MAX_IMAGE_COUNT && (
          <label className={`${s.uploadTile} ${uploading ? s.uploading : ""}`}>
            {uploading ? <LoaderCircle className={s.spin} size={24} /> : <ImagePlus size={24} />}
            <span>Thêm hình ảnh ({form.images.length}/{MAX_IMAGE_COUNT})</span>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(event) => uploadImages(event.target.files)} disabled={uploading} />
          </label>
        )}
      </div>
      {errors.images && <span className={s.fieldError}>{errors.images}</span>}
      <div className={s.ratioRow}>
        <input id="ratio-34" type="checkbox" checked={form.imageRatio === "3:4"} onChange={(event) => update("imageRatio", event.target.checked ? "3:4" : "1:1")} />
        <label htmlFor="ratio-34">Hình ảnh tỷ lệ 3:4 <span>Giúp sản phẩm thời trang thêm nổi bật với tỷ lệ hình ảnh 3:4.</span></label>
        <span className={s.exampleText}>Xem ví dụ</span>
      </div>
    </div>
  );

  const renderAttribute = (attribute) => {
    const value = form.attributes[attribute.attribute_id] || [];
    const isMulti = attribute.input_type === "MULTI_SELECT";
    const isSelect = attribute.input_type === "DROP_DOWN" || isMulti;
    const setValue = (values) => update("attributes", { ...form.attributes, [attribute.attribute_id]: values });
    const choices = Array.isArray(attribute.values) ? attribute.values : [];
    return (
      <div className={s.field} key={attribute.attribute_id}>
        <label className={s.label}>{attribute.name}{attribute.is_mandatory && <span className={s.required}> *</span>}</label>
        {isSelect ? (
          isMulti ? <div className={s.optionChecks}>{choices.map((choice) => {
            const selected = value.some((entry) => String(entry.value_id) === String(choice.value_id));
            return <label key={choice.value_id}><input type="checkbox" checked={selected} onChange={(event) => setValue(event.target.checked ? [...value, choice] : value.filter((entry) => String(entry.value_id) !== String(choice.value_id)))} />{choice.original_value_name}</label>;
          })}</div> : <select aria-label={attribute.name} value={value[0]?.value_id ?? ""} onChange={(event) => setValue(choices.filter((choice) => String(choice.value_id) === event.target.value))}>
            <option value="">Chọn {attribute.name}</option>
            {choices.map((choice) => <option key={choice.value_id} value={choice.value_id}>{choice.original_value_name}</option>)}
          </select>
        ) : <input aria-label={attribute.name} value={value[0]?.original_value_name || ""} onChange={(event) => setValue(event.target.value ? [{ value_id: 0, original_value_name: event.target.value }] : [])} />}
        {errors[`attribute-${attribute.attribute_id}`] && <span className={s.fieldError}>{errors[`attribute-${attribute.attribute_id}`]}</span>}
      </div>
    );
  };

  const renderSection = (sectionId) => {
    if (sectionId === "basic") return <>
      <section className={s.card}><h2>Thông tin cơ bản</h2>{imageManager()}
        <div className={s.field}><label className={s.label}>Video sản phẩm</label>
          <div className={s.videoRow}>{form.videoUrl ? <><Video size={20} /><span className={s.truncate}>{form.videoUrl}</span><button type="button" onClick={() => update("videoUrl", "")} aria-label="Xóa video"><Trash2 size={16} /></button></> : <label className={s.videoUpload}><Video size={20} /> Thêm video<input type="file" accept="video/mp4" onChange={(event) => uploadVideo(event.target.files?.[0])} disabled={uploading} /></label>}</div>
          <span className={s.helper}>MP4, tối đa 50 MB. Video sẽ hiển thị sau khi xử lý.</span>
        </div>
        <div className={s.field}><label className={s.label}>Tên sản phẩm <span className={s.required}>*</span></label><input aria-label="Tên sản phẩm" maxLength={120} value={form.itemName} onChange={(event) => update("itemName", event.target.value)} /><span className={s.counter}>{form.itemName.length}/120</span></div>
        <div className={s.field}><label className={s.label}>Ngành hàng <span className={s.required}>*</span></label><div className={s.categoryPath}>{selectedCategoryPath.map((category) => category.category_name).join(" › ") || "Chọn ngành hàng"}</div><div className={s.categorySelects}>{categorySelects()}</div>{errors.categoryId && <span className={s.fieldError}>{errors.categoryId}</span>}</div>
        <div className={s.field}><label className={s.label}>Mã sản phẩm</label><div className={s.gtinRow}><select aria-label="Loại mã sản phẩm" value="GTIN" disabled><option>GTIN</option></select><input value={form.gtin} onChange={(event) => update("gtin", event.target.value)} placeholder="Nhập Mã sản phẩm toàn cầu (Universal Product Code)" /></div></div>
      </section>
    </>;
    if (sectionId === "details") return <section className={s.card}><h2>Thông tin chi tiết</h2>
      {activeAttributes.length ? <div className={s.attributeGrid}>{activeAttributes.map(renderAttribute)}</div> : <p className={s.helper}>{form.categoryId ? "Ngành hàng này chưa có thuộc tính chi tiết." : "Vui lòng chọn ngành hàng để xem thuộc tính."}</p>}
      <p className={s.helper}>Hoàn thành: {activeAttributes.filter((attribute) => !attribute.is_mandatory || form.attributes[attribute.attribute_id]?.length).length} / {activeAttributes.length}</p>
    </section>;
    if (sectionId === "description") return <section className={s.card}><h2>Mô tả</h2><div className={s.field}><label className={s.label}>Mô tả sản phẩm <span className={s.required}>*</span></label><textarea aria-label="Mô tả sản phẩm" rows={12} value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Vui lòng nhập nội dung mô tả sản phẩm hoặc thêm hình ảnh" /><span className={s.counter}>{form.description.length} ký tự</span>{errors.description && <span className={s.fieldError}>{errors.description}</span>}</div></section>;
    if (sectionId === "sales") return <section className={s.card}><h2>Thông tin bán hàng</h2>
      <div className={s.field}><label className={s.label}>Phân loại hàng</label><div className={s.variationGroups}>{variationGroups.map((group, groupIndex) => <div className={s.variationGroup} key={groupIndex}><input aria-label="Tên nhóm phân loại" placeholder="Tên nhóm (ví dụ: Màu sắc)" value={group.name} onChange={(event) => setVariationGroups((current) => current.map((entry, index) => index === groupIndex ? { ...entry, name: event.target.value } : entry))} /><input aria-label="Giá trị nhóm phân loại" placeholder="Nhập các giá trị, cách nhau bằng dấu phẩy" value={group.valuesText} onChange={(event) => setVariationGroups((current) => current.map((entry, index) => index === groupIndex ? { ...entry, valuesText: event.target.value } : entry))} /><button type="button" onClick={() => setVariationGroups((current) => current.filter((_, index) => index !== groupIndex))} aria-label="Xóa nhóm"><X size={16} /></button></div>)}
        {variationGroups.length < 2 && <button className={s.outlineButton} type="button" onClick={() => setVariationGroups((current) => [...current, { name: "", valuesText: "" }])}><Plus size={16} /> Thêm nhóm phân loại</button>}</div><p className={s.helper}>Shopee hỗ trợ tối đa 2 nhóm phân loại.</p>{errors.variationGroups && <span className={s.fieldError}>{errors.variationGroups}</span>}</div>
      <div className={s.fieldGrid}><div className={s.field}><label className={s.label}>Giá <span className={s.required}>*</span></label><div className={s.moneyInput}><span>₫</span><input aria-label="Giá" type="number" min="1" step="1" value={form.originalPrice} onChange={(event) => update("originalPrice", event.target.value)} /></div>{errors.originalPrice && <span className={s.fieldError}>{errors.originalPrice}</span>}</div><div className={s.field}><label className={s.label}>Kho hàng <span className={s.required}>*</span></label><input aria-label="Kho hàng" type="number" min="0" step="1" value={form.stock} onChange={(event) => update("stock", event.target.value)} /></div></div>
      {combinations.length > 0 && <div className={s.models}><h3>Danh sách phân loại</h3>{combinations.map((combination, index) => <div className={s.modelRow} key={combination.tierIndex.join("-")}><strong>{combination.name.join(" / ")}</strong><input aria-label={`Giá ${combination.name.join(" / ")}`} type="number" min="1" placeholder="Giá (₫)" value={modelValues[index]?.price ?? ""} onChange={(event) => setModelValues((current) => ({ ...current, [index]: { ...current[index], price: event.target.value } }))} /><input aria-label={`Kho ${combination.name.join(" / ")}`} type="number" min="0" placeholder="Kho hàng" value={modelValues[index]?.stock ?? ""} onChange={(event) => setModelValues((current) => ({ ...current, [index]: { ...current[index], stock: event.target.value } }))} /></div>)}</div>}
      <div className={s.field}><label className={s.label}>Mua nhiều giảm giá</label><p className={s.helper}>Tính năng này chưa được hỗ trợ cho sản phẩm trong hệ thống.</p></div>
    </section>;
    if (sectionId === "shipping") return <section className={s.card}><h2>Vận chuyển</h2>
      <div className={s.fieldGrid}><div className={s.field}><label className={s.label}>Cân nặng (Sau khi đóng gói) <span className={s.required}>*</span></label><div className={s.unitInput}><input aria-label="Cân nặng sau khi đóng gói" type="number" min="1" value={form.weightGrams} onChange={(event) => update("weightGrams", event.target.value)} /><span>gr</span></div>{errors.weightGrams && <span className={s.fieldError}>{errors.weightGrams}</span>}</div><div className={s.field}><label className={s.label}>Kích thước đóng gói (cm)</label><div className={s.dimensionRow}>{[["R", "length"], ["D", "width"], ["C", "height"]].map(([label, key]) => <label key={key}>{label}<input type="number" min="0" value={form[key]} onChange={(event) => update(key, event.target.value)} /></label>)}</div></div></div>
      <div className={s.field}><label className={s.label}>Phí vận chuyển <span className={s.required}>*</span></label>{[...new Set(shippingOptions.map((option) => option.option_group))].map((group) => <div key={group}><h3>{group}</h3>{shippingOptions.filter((option) => option.option_group === group).map((option) => <label className={s.shippingOption} key={option.option_id}><input type="checkbox" checked={form.shippingOptionIds.includes(option.option_id)} onChange={(event) => update("shippingOptionIds", event.target.checked ? [...form.shippingOptionIds, option.option_id] : form.shippingOptionIds.filter((id) => id !== option.option_id))} /><span><strong>{option.option_name}</strong><small>{option.maximum_weight_gram ? `Tối đa ${option.maximum_weight_gram}g · ` : ""}{option.partner_label}</small></span><span className={s.switchState}>{form.shippingOptionIds.includes(option.option_id) ? "Đang bật" : "Đang tắt"}</span></label>)}</div>)}{errors.shippingOptionIds && <span className={s.fieldError}>{errors.shippingOptionIds}</span>}</div>
      <div className={s.field}><label className={s.label}>Hàng đặt trước</label><div className={s.radioRow}><label><input type="radio" checked={!form.isPreorder} onChange={() => update("isPreorder", false)} /> Không</label><label><input type="radio" checked={form.isPreorder} onChange={() => update("isPreorder", true)} /> Có</label></div>{form.isPreorder ? <><p className={s.helper}>Tôi cần {form.preorderDaysToShip || "X"} ngày chuẩn bị hàng. Bạn có thể chọn từ 5 đến 15 ngày. Shopee đề xuất chọn thời gian sớm nhất trong khả năng vận hành của bạn nhằm tăng tỉ lệ chuyển đổi!</p><div className={s.field}><label className={s.label} htmlFor="preorder-days">Số ngày chuẩn bị hàng</label><input id="preorder-days" aria-label="Số ngày chuẩn bị hàng" type="number" min="5" max="15" step="1" value={form.preorderDaysToShip} onChange={(event) => update("preorderDaysToShip", event.target.value)} /></div>{errors.preorderDaysToShip && <span className={s.fieldError}>{errors.preorderDaysToShip}</span>}</> : <p className={s.helper}>Tôi sẽ gửi hàng trong 2 ngày (không bao gồm các ngày nghỉ lễ, Tết và những ngày đơn vị vận chuyển không làm việc)</p>}</div>
    </section>;
    if (sectionId === "other") return <section className={s.card}><h2>Thông tin khác</h2><div className={s.field}><label className={s.label}>Tình trạng</label><select aria-label="Tình trạng" value={form.condition} onChange={(event) => update("condition", event.target.value)}>{(config?.product_conditions || []).map((condition) => <option key={condition.value} value={condition.value}>{condition.label}</option>)}</select></div><div className={s.field}><label className={s.label}>SKU sản phẩm</label><input aria-label="SKU sản phẩm" value={form.itemSku} onChange={(event) => update("itemSku", event.target.value)} placeholder="Nhập SKU sản phẩm" /></div></section>;
  };

  if (loading) return <div className={s.loading}><LoaderCircle className={s.spin} /> Đang tải cấu hình sản phẩm...</div>;
  if (!config) return <div className={s.page}><p className={s.alert}>{notice}</p><button className={s.secondaryButton} type="button" onClick={onCancel}>Quay lại</button></div>;

  return <div className={s.page}>
    <div className={s.titleRow}><button type="button" className={s.backButton} onClick={handleCancel}><ArrowLeft size={18} /></button><div><h1>Thêm 1 sản phẩm mới</h1><p>Nhập thông tin sản phẩm để bắt đầu tạo sản phẩm mới trong Kênh Người Bán.</p></div></div>
    {step === "entry" ? <>
      <section className={s.card}><h2>Thêm thông tin sản phẩm</h2>{imageManager()}<div className={s.field}><label className={s.label}>Tên sản phẩm <span className={s.required}>*</span></label><input maxLength={120} value={form.itemName} onChange={(event) => update("itemName", event.target.value)} placeholder="Tên thương hiệu + Loại sản phẩm + Đặc điểm nổi bật (Chất liệu, Màu sắc, Kích thước...)" /><span className={s.counter}>{form.itemName.length}/120</span>{errors.itemName && <span className={s.fieldError}>{errors.itemName}</span>}</div><div className={s.field}><label className={s.label}>Mã sản phẩm</label><div className={s.gtinRow}><select aria-label="Loại mã sản phẩm" disabled><option>GTIN</option></select><input value={form.gtin} onChange={(event) => update("gtin", event.target.value)} placeholder="Nhập Mã sản phẩm toàn cầu (Universal Product Code)" /></div></div></section>
      <div className={s.entryFooter}><button className={s.secondaryButton} type="button" onClick={handleCancel}>Hủy</button><button className={s.primaryButton} type="button" onClick={handleContinue}>Tiếp theo</button></div>
    </> : <>
      <div className={s.tabs} role="tablist">{SECTIONS.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={activeSection === id} className={activeSection === id ? s.activeTab : ""} onClick={() => selectSection(id)}>{label}</button>)}</div>
      <div className={s.sectionViewport} data-testid="section-viewport" ref={sectionViewportRef} onScroll={syncActiveSection}>
        {SECTIONS.map(([id]) => <div className={s.sectionAnchor} id={`section-${id}`} key={id}>{renderSection(id)}</div>)}
      </div>
      <footer className={s.stickyFooter}><div className={s.referenceNotice}><Info size={17} /><span>Thông tin được cung cấp hoặc điền sẵn bởi nền tảng chỉ mang tính tham khảo. Vui lòng đảm bảo tính chính xác của các chi tiết bạn gửi.</span></div><label className={s.terms}><input type="checkbox" checked={form.termsAccepted} onChange={(event) => update("termsAccepted", event.target.checked)} /> Tôi đồng ý với Điều khoản và Điều kiện.</label>{errors.termsAccepted && <span className={s.fieldError}>{errors.termsAccepted}</span>}{errors.status && <span className={s.fieldError}>{errors.status}</span>}{notice && <p className={s.alert} role="alert">{notice}</p>}{success && <p className={s.success} role="status">{success}</p>}<div className={s.footerActions}><button className={s.secondaryButton} type="button" onClick={handleCancel} disabled={saving}>Hủy</button><div>{!config.is_vacation && <button className={s.secondaryButton} type="button" onClick={() => save("NORMAL")} disabled={saving}>{saving ? "Đang lưu..." : "Đăng sản phẩm"}</button>}<button className={s.primaryButton} type="button" onClick={() => save("UNLIST")} disabled={saving}>{saving ? "Đang lưu..." : "Lưu & Ẩn"}</button></div></div></footer>
    </>}
    {notice && step === "entry" && <p className={s.alert} role="alert">{notice}</p>}
  </div>;
}
