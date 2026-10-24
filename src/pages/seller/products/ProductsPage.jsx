import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  LayoutList,
  LayoutGrid,
  Sparkles,
  Package,
  Star,
  Settings,
  Layers,
  Edit2,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  X,
  TrendingUp,
} from "lucide-react";
import api from "../../../services/api";
import sellerService from "../../../services/sellerService";
import SellerPagination from "../SellerPagination";
import s from "./ProductsPage.module.css";

const money = (n) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);

const STATUS_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "active", label: "Đang hoạt động" },
  { id: "violation", label: "Vi phạm" },
  { id: "pending_review", label: "Chờ duyệt bởi Shopee" },
  { id: "unlisted", label: "Chưa được đăng" },
];

const SUB_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "low_stock", label: "Cần bổ sung hàng" },
  { id: "needs_improvement", label: "Cần Cải Thiện Nội Dung" },
];

const QUICK_FILTER_CHIPS = [
  "Tiềm năng Dịch Vụ Hiển Thị",
  "Sản phẩm tiêu chuẩn được liên kết không chính xác",
  "Đủ điều kiện liên kết Sản phẩm tiêu chuẩn",
  "Gained Voucher",
];

export default function ProductsPage({ shopId = 727720655, onCreateProduct = () => {}, onEditProduct = () => {} }) {
  const [params, setParams] = useSearchParams();
  const activeStatusTab = params.get("prod_status") || "active";
  const activeSubTab = params.get("prod_sub") || "all";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [appliedFilters, setAppliedFilters] = useState({
    query: "",
    category: "ALL",
    role: "ALL",
  });

  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState("list");
  const [expandedModels, setExpandedModels] = useState({});
  const [activeChip, setActiveChip] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page when switching tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatusTab, activeSubTab]);

  // Modals & Notices
  const [notice, setNotice] = useState("");
  const [stockModal, setStockModal] = useState(null); // { item, model }
  const [newStockVal, setNewStockVal] = useState("");

  // Load products & categories from simulator backend
  const loadProducts = () => {
    setLoading(true);
    api
      .get(`/simulator/products?shop_id=${shopId}`)
      .then((res) => {
        setProducts(res.products || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
    api
      .get("/simulator/categories")
      .then((res) => {
        setCategories(res.categories || []);
      })
      .catch(() => {});
  }, [shopId]);

  // Tab counts calculation
  const statusCounts = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.item_status === "NORMAL").length;
    const unlisted = products.filter((p) => ["UNLIST", "SELLER_DELETE"].includes(p.item_status)).length;
    const violation = products.filter((p) => p.item_status === "BANNED").length;
    const pendingReview = products.filter((p) => p.item_status === "REVIEWING").length;

    return {
      all: total,
      active,
      unlisted,
      violation,
      pending_review: pendingReview,
    };
  }, [products]);

  const subTabCounts = useMemo(() => {
    const total = products.length;
    const lowStock = products.filter((p) => {
      const totalStock = p.models?.length
        ? p.models.reduce((sum, m) => sum + (m.seller_stock || 0), 0)
        : p.seller_stock || 0;
      return totalStock <= 10;
    }).length;
    const needsImprovement = products.filter((p) => !p.description || p.description.length < 50).length;

    return {
      all: total,
      low_stock: lowStock,
      needs_improvement: needsImprovement,
    };
  }, [products]);

  // Filter application
  const handleApplyFilter = (e) => {
    e?.preventDefault();
    setCurrentPage(1);
    setAppliedFilters({
      query: searchQuery.trim(),
      category: selectedCategory,
      role: selectedRole,
    });
  };

  const handleResetFilter = () => {
    setCurrentPage(1);
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedRole("ALL");
    setActiveChip("");
    setAppliedFilters({
      query: "",
      category: "ALL",
      role: "ALL",
    });
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // 1. Status Tab filter
        if (activeStatusTab === "active" && p.item_status !== "NORMAL") return false;
        if (activeStatusTab === "unlisted" && !["UNLIST", "SELLER_DELETE"].includes(p.item_status)) return false;
        if (activeStatusTab === "violation" && p.item_status !== "BANNED") return false;
        if (activeStatusTab === "pending_review" && p.item_status !== "REVIEWING") return false;

        // 2. Sub-tab filter
        if (activeSubTab === "low_stock") {
          const totalStock = p.models?.length
            ? p.models.reduce((sum, m) => sum + (m.seller_stock || 0), 0)
            : p.seller_stock || 0;
          if (totalStock > 10) return false;
        }
        if (activeSubTab === "needs_improvement") {
          if (p.description && p.description.length >= 50) return false;
        }

        // 3. Category filter
        if (appliedFilters.category !== "ALL" && p.category_name !== appliedFilters.category) {
          return false;
        }

        // 4. Search query
        if (appliedFilters.query) {
          const q = appliedFilters.query.toLowerCase();
          const matchTitle = p.item_name?.toLowerCase().includes(q);
          const matchId = String(p.item_id).includes(q);
          const matchSku = p.models?.some((m) => m.model_sku?.toLowerCase().includes(q));
          if (!matchTitle && !matchId && !matchSku) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return (a.original_price || 0) - (b.original_price || 0);
        if (sortBy === "price_desc") return (b.original_price || 0) - (a.original_price || 0);
        if (sortBy === "stock") {
          const stockA = a.models?.length
            ? a.models.reduce((s, m) => s + (m.seller_stock || 0), 0)
            : a.seller_stock || 0;
          const stockB = b.models?.length
            ? b.models.reduce((s, m) => s + (m.seller_stock || 0), 0)
            : b.seller_stock || 0;
          return stockA - stockB;
        }
        return b.item_id - a.item_id;
      });
  }, [products, activeStatusTab, activeSubTab, appliedFilters, sortBy]);

  // Paginated slice for current page
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Bulk selection for current page
  const handleToggleSelectAll = () => {
    const pageItemIds = paginatedProducts.map((p) => p.item_id);
    const allPageSelected = pageItemIds.length > 0 && pageItemIds.every((id) => selectedIds.includes(id));
    if (allPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageItemIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageItemIds])));
    }
  };

  const handleToggleSelectOne = (itemId) => {
    setSelectedIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    );
  };

  // Toggle Unlist
  const handleToggleUnlist = async (product) => {
    const isCurrentlyNormal = product.item_status === "NORMAL";
    const nextUnlist = isCurrentlyNormal; // true = unlist, false = publish
    try {
      await sellerService.toggleUnlist(product.item_id, shopId, nextUnlist);
      setProducts((prev) =>
        prev.map((p) =>
          p.item_id === product.item_id
            ? { ...p, item_status: nextUnlist ? "UNLIST" : "NORMAL" }
            : p,
        ),
      );
      setNotice(
        nextUnlist
          ? `Đã ẩn sản phẩm "${product.item_name}".`
          : `Đã mở bán sản phẩm "${product.item_name}".`,
      );
    } catch (err) {
      setNotice(err.message || "Cập nhật trạng thái sản phẩm thất bại.");
    }
  };

  // Quick stock update
  const handleSaveStock = async () => {
    if (!stockModal || newStockVal === "") return;
    try {
      const stockNum = Number(newStockVal);
      await sellerService.quickUpdateStock(
        stockModal.item.item_id,
        stockModal.model?.model_id,
        stockNum,
        shopId,
      );
      setNotice(`Đã cập nhật số lượng kho thành công!`);
      loadProducts();
      setStockModal(null);
    } catch (err) {
      setNotice(err.message || "Không thể cập nhật kho.");
    }
  };

  // Toggle model variations expansion
  const toggleExpand = (itemId) => {
    setExpandedModels((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  return (
    <div className={s.pageWrapper}>
      {/* 1. Page Header */}
      <div className={s.headerRow}>
        <h1 className={s.pageTitle}>Sản phẩm</h1>
        <div className={s.headerActions}>
          <div className={s.dropdownBtn}>
            <Settings size={15} /> Cài đặt sản phẩm <ChevronDown size={14} />
          </div>
          <div className={s.dropdownBtn}>
            <Layers size={15} /> Công cụ xử lý hàng loạt <ChevronDown size={14} />
          </div>
          <button
            type="button"
            className={s.btnAddProduct}
            onClick={onCreateProduct}
          >
            <Plus size={16} /> + Thêm 1 sản phẩm mới
          </button>
        </div>
      </div>

      {/* 2. Product Status Tabs */}
      <div className={s.statusTabsRow} role="tablist">
        {STATUS_TABS.map((tab) => {
          const isSelected = activeStatusTab === tab.id;
          const count = statusCounts[tab.id] ?? 0;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isSelected}
              className={`${s.statusTabBtn} ${isSelected ? s.statusTabActive : ""}`}
              onClick={() => {
                const next = new URLSearchParams(params);
                next.set("prod_status", tab.id);
                setParams(next);
              }}
            >
              <span>{tab.label}</span>
              <span className={s.statusBadge}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Product Panel */}
      <div className={s.mainPanel}>
        {/* Product Sub-Tabs */}
        <div className={s.subTabsRow}>
          {SUB_TABS.map((sub) => {
            const isSelected = activeSubTab === sub.id;
            const count = subTabCounts[sub.id] ?? 0;
            return (
              <button
                key={sub.id}
                className={`${s.subTabBtn} ${isSelected ? s.subTabActive : ""}`}
                onClick={() => {
                  const next = new URLSearchParams(params);
                  next.set("prod_sub", sub.id);
                  setParams(next);
                }}
              >
                <span>{sub.label}</span>
                <span className={s.subBadge}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* 4. Search and Filter Toolbar */}
        <form className={s.filterToolbar} onSubmit={handleApplyFilter}>
          <div className={s.searchInputWrap}>
            <Search size={16} className={s.searchIcon} />
            <input
              type="text"
              className={s.searchInput}
              placeholder="Tìm Tên sản phẩm, SKU sản phẩm, SKU phân loại, ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={s.filterSelectWrap}>
            <label className={s.filterLabel}>Ngành hàng</label>
            <select
              className={s.filterSelect}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">Tất cả ngành hàng</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_name}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>

          <div className={s.filterSelectWrap}>
            <label className={s.filterLabel}>Sản phẩm chủ lực</label>
            <select
              className={s.filterSelect}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="ALL">Tất cả</option>
              <option value="HERO">Sản phẩm chủ lực</option>
              <option value="REGULAR">Sản phẩm thông thường</option>
            </select>
          </div>

          <div className={s.toolbarButtons}>
            <button type="submit" className={s.btnApply}>
              Áp dụng
            </button>
            <button type="button" className={s.btnReset} onClick={handleResetFilter}>
              Đặt lại
            </button>
          </div>
        </form>

        {/* 5. Product Count, Quick Filters, and View Controls */}
        <div className={s.metaControlsRow}>
          <div className={s.leftMeta}>
            <span className={s.productCountBold}>
              {loading ? "Đang tải..." : `${filteredProducts.length} Sản Phẩm`}
            </span>

            <div className={s.chipList}>
              {QUICK_FILTER_CHIPS.map((chip) => {
                const isSelected = activeChip === chip;
                return (
                  <button
                    key={chip}
                    type="button"
                    className={`${s.filterChip} ${isSelected ? s.chipSelected : ""}`}
                    onClick={() => setActiveChip(isSelected ? "" : chip)}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={s.rightMeta}>
            <select
              className={s.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sắp xếp sản phẩm"
            >
              <option value="default">Sắp xếp theo gợi ý</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
              <option value="stock">Kho hàng</option>
            </select>

            <div className={s.viewToggles}>
              <button
                type="button"
                className={`${s.viewBtn} ${viewMode === "list" ? s.viewActive : ""}`}
                onClick={() => setViewMode("list")}
                title="Dạng danh sách"
              >
                <LayoutList size={16} />
              </button>
              <button
                type="button"
                className={`${s.viewBtn} ${viewMode === "grid" ? s.viewActive : ""}`}
                onClick={() => setViewMode("grid")}
                title="Dạng lưới"
              >
                <LayoutGrid size={16} />
              </button>
            </div>

            <button
              type="button"
              className={s.btnAiTool}
              onClick={() => setNotice("Công cụ Tối ưu AI đang được chuẩn bị cho bản phát hành kế tiếp.")}
            >
              <Sparkles size={14} /> Công cụ Tối ưu AI
            </button>
          </div>
        </div>

        {/* 6. Product Table */}
        <div className={s.tableContainer}>
          <table className={s.productsTable}>
            <thead>
              <tr>
                <th style={{ width: "38px" }}>
                  <input
                    type="checkbox"
                    checked={
                      paginatedProducts.length > 0 &&
                      paginatedProducts.every((p) => selectedIds.includes(p.item_id))
                    }
                    onChange={handleToggleSelectAll}
                    aria-label="Chọn tất cả sản phẩm"
                  />
                </th>
                <th style={{ width: "40%" }}>Tên sản phẩm</th>
                <th style={{ width: "14%" }}>Giá</th>
                <th style={{ width: "12%" }}>Kho hàng</th>
                <th style={{ width: "12%" }}>Hiệu suất</th>
                <th style={{ width: "10%" }}>Đánh giá sản phẩm</th>
                <th style={{ width: "12%" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((p) => {
                const isSelected = selectedIds.includes(p.item_id);
                const hasModels = p.has_model && p.models && p.models.length > 0;
                const totalStock = hasModels
                  ? p.models.reduce((acc, m) => acc + (m.seller_stock || 0), 0)
                  : p.seller_stock || 0;
                const isExpanded = expandedModels[p.item_id] ?? false;

                // Variations limit preview to 2 unless expanded
                const visibleModels = hasModels
                  ? isExpanded
                    ? p.models
                    : p.models.slice(0, 2)
                  : [];
                const remainingModelsCount = hasModels ? Math.max(0, p.models.length - 2) : 0;
                const firstImg = p.images?.image_url_list?.[0];

                return (
                  <React.Fragment key={p.item_id}>
                    {/* Top Level Parent Product Row */}
                    <tr className={`${s.productRow} ${isSelected ? s.rowSelected : ""}`}>
                      <td className={s.checkboxCell}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(p.item_id)}
                          aria-label={`Chọn sản phẩm ${p.item_name}`}
                        />
                      </td>

                      {/* Tên sản phẩm */}
                      <td className={s.titleCell}>
                        <div className={s.titleWrap}>
                          {firstImg ? (
                            <img src={firstImg} alt="" className={s.thumbImg} />
                          ) : (
                            <div className={s.thumbFallback}>
                              <Package size={22} color="#bfbfbf" />
                            </div>
                          )}
                          <div className={s.titleDetails}>
                            <span className={s.productName}>{p.item_name}</span>
                            <div className={s.skuIdLine}>
                              <span>ID: {p.item_id}</span>
                              <span className={s.categoryTag}>{p.category_name}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Giá */}
                      <td className={s.priceCell}>
                        <span className={s.priceVnd}>{money(p.original_price)}</span>
                      </td>

                      {/* Kho hàng */}
                      <td className={s.stockCell}>
                        <span className={totalStock === 0 ? s.outOfStock : s.stockVal}>
                          {totalStock === 0 ? "Hết hàng" : totalStock}
                        </span>
                      </td>

                      {/* Hiệu suất */}
                      <td className={s.perfCell}>
                        <span className={s.salesStat}>
                          <TrendingUp size={12} /> Doanh số 7
                        </span>
                      </td>

                      {/* Đánh giá */}
                      <td className={s.ratingCell}>
                        <span className={s.ratingVal}>
                          <Star size={13} fill="#faad14" color="#faad14" /> 5.0
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className={s.actionsCell}>
                        <div className={s.actionLinks}>
                          <button
                            type="button"
                            className={s.actionLink}
                            onClick={() => onEditProduct(p)}
                          >
                            Cập nhật
                          </button>
                          <button
                            type="button"
                            className={s.actionLink}
                            onClick={() => handleToggleUnlist(p)}
                          >
                            {p.item_status === "NORMAL" ? "Ẩn" : "Hiện"}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Variation Sub-rows */}
                    {hasModels &&
                      visibleModels.map((m) => (
                        <tr key={m.model_id} className={s.variationRow}>
                          <td />
                          <td className={s.variationTitleCell}>
                            <div className={s.variationIndent}>
                              <span className={s.varTreeSymbol}>└</span>
                              <div className={s.varMeta}>
                                <span className={s.varName}>{m.model_name}</span>
                                {m.model_sku && (
                                  <span className={s.varSku}>SKU: {m.model_sku}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className={s.priceCell}>
                            <span className={s.varPrice}>{money(m.original_price)}</span>
                          </td>
                          <td className={s.stockCell}>
                            <span className={m.seller_stock === 0 ? s.outOfStock : s.stockVal}>
                              {m.seller_stock === 0 ? "Hết hàng" : m.seller_stock}
                            </span>
                          </td>
                          <td className={s.perfCell}>—</td>
                          <td className={s.ratingCell}>—</td>
                          <td className={s.actionsCell}>
                            <button
                              type="button"
                              className={s.actionLink}
                              onClick={() => {
                                setStockModal({ item: p, model: m });
                                setNewStockVal(String(m.seller_stock));
                              }}
                            >
                              Sửa kho
                            </button>
                          </td>
                        </tr>
                      ))}

                    {/* Variation Expansion Toggle */}
                    {hasModels && remainingModelsCount > 0 && !isExpanded && (
                      <tr className={s.expansionRow}>
                        <td />
                        <td colSpan={6}>
                          <button
                            type="button"
                            className={s.btnExpandVariations}
                            onClick={() => toggleExpand(p.item_id)}
                          >
                            Xem thêm (còn {remainingModelsCount} phân loại) <ChevronDown size={14} />
                          </button>
                        </td>
                      </tr>
                    )}

                    {hasModels && isExpanded && p.models.length > 2 && (
                      <tr className={s.expansionRow}>
                        <td />
                        <td colSpan={6}>
                          <button
                            type="button"
                            className={s.btnExpandVariations}
                            onClick={() => toggleExpand(p.item_id)}
                          >
                            Thu gọn phân loại <ChevronUp size={14} />
                          </button>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {!loading && filteredProducts.length === 0 && (
            <div className={s.emptyState}>
              <Package size={52} strokeWidth={1.2} color="#bfbfbf" />
              <p className={s.emptyMessage}>Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>
            </div>
          )}
        </div>

        {/* 7. Pagination */}
        <SellerPagination
          currentPage={currentPage}
          totalItems={filteredProducts.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Stock Edit Modal */}
      {stockModal && (
        <div className={s.modalOverlay} onClick={() => setStockModal(null)}>
          <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3>Cập nhật kho hàng</h3>
              <button
                type="button"
                className={s.modalClose}
                onClick={() => setStockModal(null)}
              >
                ×
              </button>
            </div>
            <div className={s.modalBody}>
              <p>
                Sản phẩm: <strong>{stockModal.item.item_name}</strong>
              </p>
              {stockModal.model && (
                <p>
                  Phân loại: <strong>{stockModal.model.model_name}</strong>
                </p>
              )}
              <div className={s.inputField}>
                <label>Số lượng tồn kho:</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className={s.numberInput}
                  value={newStockVal}
                  onChange={(e) => setNewStockVal(e.target.value)}
                />
              </div>
            </div>
            <div className={s.modalFooter}>
              <button
                type="button"
                className={s.btnCancel}
                onClick={() => setStockModal(null)}
              >
                Hủy
              </button>
              <button type="button" className={s.btnConfirm} onClick={handleSaveStock}>
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {notice && (
        <div className={s.toast}>
          <CheckCircle2 size={16} color="#52c41a" />
          <span>{notice}</span>
          <button type="button" className={s.toastClose} onClick={() => setNotice("")}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}
