import React, { useEffect, useMemo, useState } from "react";
import { X, Search, Info } from "lucide-react";
import api from "../../../services/api";
import styles from "./ProductSelectModal.module.css";

const formatMoney = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount || 0);

export default function ProductSelectModal({
  isOpen,
  shopId,
  initialSelectedItems = [],
  onClose,
  onConfirm,
}) {
  const [activeTab, setActiveTab] = useState("select"); // 'select' | 'batch'
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [keywordDraft, setKeywordDraft] = useState("");
  const [keyword, setKeyword] = useState("");
  const [inStockOnly, setInStockOnly] = useState(true);
  const [selectedMap, setSelectedMap] = useState({});

  // Initialize selectedMap from initialSelectedItems when modal opens
  useEffect(() => {
    if (isOpen) {
      const map = {};
      (initialSelectedItems || []).forEach((item) => {
        if (item && item.item_id) {
          map[String(item.item_id)] = item;
        }
      });
      setSelectedMap(map);
      setKeywordDraft("");
      setKeyword("");
      setCategoryFilter("ALL");
      setInStockOnly(true);
      setActiveTab("select");
    }
  }, [isOpen, initialSelectedItems]);

  // Load products & categories
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    Promise.all([
      api.get(`/simulator/products?shop_id=${shopId}`),
      api.get("/simulator/categories"),
    ])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.products || []);
        setCategories(catRes.categories || []);
      })
      .catch((err) => {
        console.error("Failed to load products for selector:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, shopId]);

  // Filtered product list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Stock check
      const stock =
        Array.isArray(p.models) && p.models.length
          ? p.models.reduce((sum, m) => sum + Number(m.seller_stock || m.normal_stock || 0), 0)
          : Number(p.normal_stock ?? p.stock ?? 50);

      if (inStockOnly && stock <= 0) return false;

      // Category check
      if (categoryFilter !== "ALL" && String(p.category_id) !== String(categoryFilter)) {
        return false;
      }

      // Keyword check
      if (keyword) {
        const query = keyword.toLowerCase();
        const nameMatch = (p.item_name || "").toLowerCase().includes(query);
        const codeMatch = String(p.item_id).includes(query);
        if (!nameMatch && !codeMatch) return false;
      }

      return true;
    });
  }, [products, inStockOnly, categoryFilter, keyword]);

  const allFilteredSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => Boolean(selectedMap[String(p.item_id)]));

  const handleToggleSelectAll = () => {
    const nextMap = { ...selectedMap };
    if (allFilteredSelected) {
      filteredProducts.forEach((p) => {
        delete nextMap[String(p.item_id)];
      });
    } else {
      filteredProducts.forEach((p) => {
        const stock =
          Array.isArray(p.models) && p.models.length
            ? p.models.reduce((sum, m) => sum + Number(m.seller_stock || m.normal_stock || 0), 0)
            : Number(p.normal_stock ?? p.stock ?? 50);
        nextMap[String(p.item_id)] = {
          item_id: p.item_id,
          item_name: p.item_name,
          image: p.image || p.images?.[0] || "",
          price: Number(p.current_price || p.original_price || 0),
          stock,
        };
      });
    }
    setSelectedMap(nextMap);
  };

  const handleToggleProduct = (p) => {
    const key = String(p.item_id);
    const nextMap = { ...selectedMap };
    if (nextMap[key]) {
      delete nextMap[key];
    } else {
      const stock =
        Array.isArray(p.models) && p.models.length
          ? p.models.reduce((sum, m) => sum + Number(m.seller_stock || m.normal_stock || 0), 0)
          : Number(p.normal_stock ?? p.stock ?? 50);
      nextMap[key] = {
        item_id: p.item_id,
        item_name: p.item_name,
        image: p.image || p.images?.[0] || "",
        price: Number(p.current_price || p.original_price || 0),
        stock,
      };
    }
    setSelectedMap(nextMap);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(keywordDraft.trim());
  };

  const handleReset = () => {
    setKeywordDraft("");
    setKeyword("");
    setCategoryFilter("ALL");
    setInStockOnly(true);
  };

  const handleConfirm = () => {
    onConfirm(Object.values(selectedMap));
    onClose();
  };

  if (!isOpen) return null;

  const selectedCount = Object.keys(selectedMap).length;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Chọn Sản Phẩm</h3>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "select" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("select")}
          >
            Chọn
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "batch" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("batch")}
          >
            Đăng Danh Sách Sản Phẩm
          </button>
        </div>

        {activeTab === "batch" ? (
          <div className={styles.body} style={{ padding: "48px 24px", textAlign: "center" }}>
            <p style={{ color: "#666", fontSize: "14px" }}>
              Tính năng đăng tải danh sách sản phẩm bằng file Excel hiện đang được hoàn thiện.
            </p>
            <p style={{ color: "#999", fontSize: "12px", marginTop: "8px" }}>
              Vui lòng chuyển sang tab <strong>Chọn</strong> để chọn trực tiếp các sản phẩm trong kho của Shop.
            </p>
          </div>
        ) : (
          <>
            <form className={styles.filterBar} onSubmit={handleSearch}>
              <div className={styles.filterItem}>
                <label>Ngành hàng:</label>
                <select
                  className={styles.selectInput}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="ALL">Tất cả ngành hàng</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.display_category_name || cat.original_category_name || `Ngành hàng ${cat.category_id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterItem}>
                <label>Tìm:</label>
                <select className={styles.selectInput} defaultValue="name">
                  <option value="name">Tên sản phẩm</option>
                </select>
                <input
                  type="text"
                  className={styles.textInput}
                  placeholder="Nhập tên sản phẩm..."
                  value={keywordDraft}
                  onChange={(e) => setKeywordDraft(e.target.value)}
                />
              </div>

              <div className={styles.filterButtons}>
                <button type="submit" className={styles.searchBtn}>
                  Tìm
                </button>
                <button type="button" className={styles.resetBtn} onClick={handleReset}>
                  Đặt lại
                </button>
              </div>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
                Xem sản phẩm có sẵn
              </label>
            </form>

            <div className={styles.body}>
              {loading ? (
                <div className={styles.loadingState}>Đang tải danh sách sản phẩm...</div>
              ) : filteredProducts.length === 0 ? (
                <div className={styles.emptyState}>Không tìm thấy sản phẩm phù hợp.</div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.checkboxCol}>
                        <input
                          type="checkbox"
                          checked={allFilteredSelected}
                          onChange={handleToggleSelectAll}
                          aria-label="Chọn tất cả"
                        />
                      </th>
                      <th>Sản Phẩm</th>
                      <th style={{ width: 100 }}>Doanh số</th>
                      <th style={{ width: 130 }}>Giá</th>
                      <th style={{ width: 110 }}>
                        Kho hàng <Info size={13} style={{ verticalAlign: "middle", color: "#999" }} />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => {
                      const isSelected = Boolean(selectedMap[String(p.item_id)]);
                      const stock =
                        Array.isArray(p.models) && p.models.length
                          ? p.models.reduce((sum, m) => sum + Number(m.seller_stock || m.normal_stock || 0), 0)
                          : Number(p.normal_stock ?? p.stock ?? 50);
                      const price = Number(p.current_price || p.original_price || 0);
                      const thumb = p.image || p.images?.[0] || "";

                      return (
                        <tr key={p.item_id} onClick={() => handleToggleProduct(p)} style={{ cursor: "pointer" }}>
                          <td className={styles.checkboxCol} onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleProduct(p)}
                            />
                          </td>
                          <td>
                            <div className={styles.productCell}>
                              {thumb ? (
                                <img src={thumb} alt={p.item_name} className={styles.productThumb} />
                              ) : (
                                <div className={styles.productThumb} style={{ display: "grid", placeItems: "center", color: "#aaa", fontSize: "10px" }}>
                                  No Img
                                </div>
                              )}
                              <div className={styles.productDetails}>
                                <div className={styles.productName} title={p.item_name}>
                                  {p.item_name}
                                </div>
                                <div className={styles.productCode}>Mã: {p.item_id}</div>
                              </div>
                            </div>
                          </td>
                          <td>{p.sales || p.sold || 0}</td>
                          <td className={styles.priceText}>{formatMoney(price)}</td>
                          <td className={styles.stockCol}>{stock}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        <div className={styles.footer}>
          <div className={styles.footerSelection}>
            Đã chọn: <strong>{selectedCount}</strong> sản phẩm
          </div>
          <div className={styles.footerActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Hủy
            </button>
            <button
              type="button"
              className={styles.confirmBtn}
              aria-label="Xác nhận chọn sản phẩm"
              onClick={handleConfirm}
              disabled={selectedCount === 0}
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
