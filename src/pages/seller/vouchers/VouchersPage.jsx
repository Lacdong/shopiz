import React, { useEffect, useMemo, useState } from "react";
import {
  Store,
  Package,
  Lock,
  Video,
  PlayCircle,
  UserPlus,
  Users,
  HeartHandshake,
  Ticket,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  Trash2,
  Info,
  Check,
  AlertCircle,
} from "lucide-react";
import sellerService from "../../../services/sellerService";
import SellerPagination from "../SellerPagination";
import ProductSelectModal from "./ProductSelectModal";
import VoucherDetailModal from "./VoucherDetailModal";
import VoucherOrdersModal from "./VoucherOrdersModal";
import styles from "./VouchersPage.module.css";

const formatMoney = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatTimestamp = (ts) => {
  if (!ts) return "—";
  const date = new Date(ts * 1000);
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const toLocalDatetimeString = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
};

const USECASE_DETAILS = {
  1: {
    name: "Voucher toàn Shop",
    desc: "Voucher áp dụng cho tất cả sản phẩm trong Shop của bạn",
    icon: Store,
    section: "conversion",
  },
  2: {
    name: "Voucher sản phẩm",
    desc: "Voucher chỉ áp dụng cho những sản phẩm nhất định mà Shop chọn",
    icon: Package,
    section: "conversion",
  },
  5: {
    name: "Voucher riêng tư",
    desc: "Voucher áp dụng cho nhóm Khách hàng Shop muốn thông qua mã Voucher",
    icon: Lock,
    section: "channel",
  },
  6: {
    name: "Voucher Shopee Live",
    desc: "Voucher độc quyền áp dụng các sản phẩm trong livestream của Shop thúc đẩy chuyển đổi đơn...",
    icon: Video,
    section: "channel",
  },
  7: {
    name: "Voucher Shopee Video",
    desc: "Voucher áp dụng độc quyền cho các sản phẩm trên Video của Shop để tăng doanh số bán hàng",
    icon: PlayCircle,
    section: "channel",
  },
  3: {
    name: "Voucher Khách hàng mới",
    desc: "Voucher nhằm thu hút Khách hàng mới và Khách hàng tiềm năng",
    icon: UserPlus,
    section: "audience",
  },
  4: {
    name: "Voucher Khách hàng mua lại",
    desc: "Voucher nhằm thu hút khách hàng mục tiêu có đơn mua lại tại Shop",
    icon: Users,
    section: "audience",
  },
  9: {
    name: "Voucher Ưu Đãi Follower",
    desc: "Khuyến khích người mua theo dõi Shop bằng cách tặng Voucher cho người theo dõi mới",
    icon: HeartHandshake,
    section: "audience",
  },
};

export default function VouchersPage({ shopId = 727720655 }) {
  const activeShopId = Number(shopId) || 727720655;

  // View state: 'list' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState("list");
  const [activeMainTab, setActiveMainTab] = useState("list"); // 'list' | 'package'
  const [statusTab, setStatusTab] = useState("all"); // 'all' | 'ongoing' | 'upcoming' | 'expired'
  const [isLandingExpanded, setIsLandingExpanded] = useState(true);

  // Search state
  const [searchType, setSearchType] = useState("voucher_name");
  const [keywordDraft, setKeywordDraft] = useState("");
  const [keyword, setKeyword] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Data state
  const [vouchers, setVouchers] = useState([]);
  const [statusCounts, setStatusCounts] = useState({ all: 0, ongoing: 0, upcoming: 0, expired: 0 });
  const [voucherConfig, setVoucherConfig] = useState({ prefix: "SMAR", supported_usecases: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Modals state
  const [detailModalVoucher, setDetailModalVoucher] = useState(null);
  const [ordersModalCode, setOrdersModalCode] = useState(null);
  const [productSelectOpen, setProductSelectOpen] = useState(false);

  // Workflow form state
  const [formUsecase, setFormUsecase] = useState(1);
  const [editingVoucherId, setEditingVoucherId] = useState(null);
  const [formVoucherName, setFormVoucherName] = useState("");
  const [formCodeSuffix, setFormCodeSuffix] = useState("");
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");
  const [formDisplayTiming, setFormDisplayTiming] = useState(false);

  // Benefit settings
  const [formRewardType, setFormRewardType] = useState(1); // 1: discount, 3: coins (disabled)
  const [formDiscountType, setFormDiscountType] = useState("amount"); // 'amount' | 'percent'
  const [formDiscountAmount, setFormDiscountAmount] = useState(10000);
  const [formDiscountPercent, setFormDiscountPercent] = useState(10);
  const [formHasMaxPrice, setFormHasMaxPrice] = useState(false);
  const [formMaxPrice, setFormMaxPrice] = useState(50000);
  const [formMinBasketPrice, setFormMinBasketPrice] = useState(50000);
  const [formUsageQuantity, setFormUsageQuantity] = useState(100);
  const [formMaxPerBuyer, setFormMaxPerBuyer] = useState(1);

  // Audience & Channel settings
  const [formDisplayChannel, setFormDisplayChannel] = useState("all"); // 'all' | 'private'
  const [formTargetVoucher, setFormTargetVoucher] = useState(1); // 1: new user, 2: repeat 1 order, 3: repeat 2 orders
  const [formLookbackDays, setFormLookbackDays] = useState(30);
  const [formSelectedItems, setFormSelectedItems] = useState([]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Load config once
  useEffect(() => {
    sellerService
      .getVoucherConfig(activeShopId)
      .then((res) => {
        setVoucherConfig(res);
      })
      .catch((err) => {
        console.error("Failed to load voucher config:", err);
      });
  }, [activeShopId]);

  // Load vouchers list
  useEffect(() => {
    if (viewMode !== "list") return;
    setLoading(true);
    setError("");

    sellerService
      .getVouchers(activeShopId, {
        status: statusTab,
        searchType,
        keyword,
        pageNo: currentPage,
        pageSize,
      })
      .then((res) => {
        setVouchers(res.vouchers || []);
        setTotalItems(res.total || 0);
        if (res.status_counts) {
          setStatusCounts(res.status_counts);
        }
      })
      .catch((err) => {
        setError(err.message || "Không thể tải danh sách mã giảm giá.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeShopId, viewMode, statusTab, searchType, keyword, currentPage, pageSize, refreshKey]);

  // Search handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setKeyword(keywordDraft.trim());
  };

  const handleSearchReset = () => {
    setKeywordDraft("");
    setKeyword("");
    setCurrentPage(1);
  };

  // Open Create Workflow for a usecase
  const handleOpenCreate = (usecase) => {
    const now = new Date();
    const oneWeekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    setFormUsecase(usecase);
    setEditingVoucherId(null);
    setFormVoucherName("");
    setFormCodeSuffix("");
    setFormStartTime(toLocalDatetimeString(now));
    setFormEndTime(toLocalDatetimeString(oneWeekLater));
    setFormDisplayTiming(false);

    setFormRewardType(1);
    setFormDiscountType("amount");
    setFormDiscountAmount(10000);
    setFormDiscountPercent(10);
    setFormHasMaxPrice(false);
    setFormMaxPrice(50000);
    setFormMinBasketPrice(50000);
    setFormUsageQuantity(usecase === 9 ? 50 : 100);
    setFormMaxPerBuyer(1);

    // Channel & Audience defaults based on usecase
    if (usecase === 5) {
      setFormDisplayChannel("private");
    } else {
      setFormDisplayChannel("all");
    }

    if (usecase === 3) {
      setFormTargetVoucher(1);
    } else if (usecase === 4) {
      setFormTargetVoucher(2);
      setFormLookbackDays(30);
    } else {
      setFormTargetVoucher(0);
    }

    setFormSelectedItems([]);
    setFormError("");
    setViewMode("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Open Copy Workflow
  const handleOpenCopy = (v) => {
    handleOpenCreate(v.usecase);
    setFormVoucherName(`${v.voucher_name} (Bản sao)`);
    setFormDiscountType(v.discount_percentage > 0 ? "percent" : "amount");
    setFormDiscountAmount(v.discount_amount || 10000);
    setFormDiscountPercent(v.discount_percentage || 10);
    setFormHasMaxPrice(Boolean(v.max_price && v.max_price > 0));
    setFormMaxPrice(v.max_price || 50000);
    setFormMinBasketPrice(v.min_basket_price || 50000);
    setFormUsageQuantity(v.usage_quantity || 100);
    setFormMaxPerBuyer(v.max_distribution_per_buyer || 1);
    setFormDisplayTiming(Boolean(v.display_timing));
    setFormTargetVoucher(v.target_voucher || 0);

    if (v.items && v.items.length) {
      setFormSelectedItems(v.items);
    }
  };

  // End Voucher handler
  const handleEndVoucher = async (v) => {
    if (!window.confirm(`Bạn có chắc chắn muốn kết thúc sớm mã giảm giá "${v.voucher_name}" (${v.voucher_code})?`)) {
      return;
    }
    try {
      await sellerService.endVoucher(v.voucher_id);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert(err.message || "Không thể kết thúc mã giảm giá.");
    }
  };

  // Delete Voucher handler
  const handleDeleteVoucher = async (v) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa mã giảm giá sắp diễn ra "${v.voucher_name}"?`)) {
      return;
    }
    try {
      await sellerService.deleteVoucher(v.voucher_id);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert(err.message || "Không thể xóa mã giảm giá.");
    }
  };

  // Submit Voucher Form
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError("");

    // Validate name
    if (!formVoucherName.trim()) {
      setFormError(formUsecase === 9 ? "Vui lòng nhập tên chương trình Ưu Đãi Follower." : "Vui lòng nhập tên chương trình giảm giá.");
      return;
    }
    if (formUsecase === 9 && formVoucherName.trim().length > 20) {
      setFormError("Tên chương trình Ưu Đãi Follower không được vượt quá 20 ký tự.");
      return;
    }

    // Validate code for non-Live/Video/Follower
    const prefix = voucherConfig.prefix || "SMAR";
    let fullCode = "";
    if (formUsecase !== 6 && formUsecase !== 7 && formUsecase !== 9) {
      if (!formCodeSuffix.trim()) {
        setFormError("Vui lòng nhập mã voucher (tối đa 5 ký tự chữ cái và số).");
        return;
      }
      const regex = /^[A-Z0-9]{1,5}$/;
      if (!regex.test(formCodeSuffix.trim())) {
        setFormError("Mã voucher chỉ được bao gồm chữ cái in hoa (A-Z) và số (0-9), tối đa 5 ký tự.");
        return;
      }
      fullCode = `${prefix}${formCodeSuffix.trim()}`;
    }

    // Validate dates
    const startSec = Math.floor(new Date(formStartTime).getTime() / 1000);
    const endSec = Math.floor(new Date(formEndTime).getTime() / 1000);
    if (!startSec || !endSec || endSec <= startSec) {
      setFormError("Thời gian kết thúc phải sau thời gian bắt đầu.");
      return;
    }

    // Validate discount & min basket
    const minBasket = Number(formMinBasketPrice) || 0;
    let discountAmount = 0;
    let discountPercent = 0;
    let maxPrice = 0;

    if (formDiscountType === "amount") {
      discountAmount = Number(formDiscountAmount) || 0;
      if (discountAmount <= 0) {
        setFormError("Mức giảm giá phải lớn hơn 0 ₫.");
        return;
      }
      if (discountAmount >= minBasket) {
        setFormError("Mức giảm giá theo số tiền phải nhỏ hơn giá trị đơn hàng tối thiểu.");
        return;
      }
    } else {
      discountPercent = Number(formDiscountPercent) || 0;
      if (discountPercent <= 0 || discountPercent > 99) {
        setFormError("Phần trăm giảm giá phải từ 1% đến 99%.");
        return;
      }
      if (formHasMaxPrice) {
        maxPrice = Number(formMaxPrice) || 0;
        if (maxPrice <= 0) {
          setFormError("Mức giảm tối đa phải lớn hơn 0 ₫.");
          return;
        }
      }
    }

    // Validate product voucher selection
    if (formUsecase === 2 && formSelectedItems.length === 0) {
      setFormError("Vui lòng chọn ít nhất 1 sản phẩm áp dụng cho Voucher sản phẩm.");
      return;
    }

    const payload = {
      shop_id: activeShopId,
      voucher_name: formVoucherName.trim(),
      voucher_code: fullCode,
      start_time: startSec,
      end_time: endSec,
      voucher_type: formUsecase === 2 ? 2 : 1,
      reward_type: 1, // coins disabled
      usecase: formUsecase,
      min_basket_price: minBasket,
      usage_quantity: Number(formUsageQuantity) || 100,
      max_distribution_per_buyer: Number(formMaxPerBuyer) || 1,
      display_channel_list:
        formUsecase === 5
          ? []
          : formUsecase === 6
          ? [4]
          : formUsecase === 7
          ? [3]
          : formUsecase === 9
          ? [1]
          : formDisplayChannel === "private"
          ? []
          : [1],
      item_id_list: formUsecase === 2 ? formSelectedItems.map((it) => it.item_id) : [],
      display_timing: formDisplayTiming ? 1 : 0,
      target_voucher: formTargetVoucher,
    };

    if (formDiscountType === "amount") {
      payload.discount_amount = discountAmount;
      payload.discount_percentage = 0;
      payload.max_price = 0;
    } else {
      payload.discount_amount = 0;
      payload.discount_percentage = discountPercent;
      payload.max_price = maxPrice;
    }

    setFormSubmitting(true);
    try {
      if (editingVoucherId) {
        payload.voucher_id = editingVoucherId;
        await sellerService.updateVoucher(payload);
      } else {
        await sellerService.createVoucher(payload);
      }
      setViewMode("list");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setFormError(err.message || "Không thể tạo mã giảm giá. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const currentUsecaseMeta = USECASE_DETAILS[formUsecase] || USECASE_DETAILS[1];
  const UsecaseIcon = currentUsecaseMeta.icon;

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <span>Trang chủ</span>
        <span>&gt;</span>
        <span>Kênh Marketing</span>
        <span>&gt;</span>
        <span>Mã Giảm Giá Của Shop</span>
        {viewMode !== "list" && (
          <>
            <span>&gt;</span>
            <span>{editingVoucherId ? "Cập nhật mã giảm giá" : "Tạo mã giảm giá mới"}</span>
          </>
        )}
      </div>

      {viewMode === "list" ? (
        <>
          {/* State A: Landing / Create Voucher Section */}
          <div className={styles.landingCard}>
            <div className={styles.landingHeader}>
              <h2 className={styles.landingTitle}>Tạo Voucher</h2>
              <p className={styles.landingDesc}>
                Tạo Mã giảm giá toàn shop hoặc Mã giảm giá sản phẩm ngay bây giờ để thu hút người mua.
                <a
                  href="#learn-more"
                  className={styles.learnMoreLink}
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Tìm hiểu thêm về các loại mã giảm giá của Shopee tại Học Viện Shopee.");
                  }}
                >
                  Tìm hiểu thêm
                </a>
              </p>
            </div>

            {/* Section A: Cải thiện tỷ lệ chuyển đổi */}
            <div className={styles.groupSection}>
              <div className={styles.groupTitle}>Cải thiện tỷ lệ chuyển đổi</div>
              <div className={styles.cardsGrid2}>
                <div className={styles.voucherCard}>
                  <div className={styles.cardTop}>
                    <div className={styles.cardIcon}>
                      <Store size={22} />
                    </div>
                    <div className={styles.cardInfo}>
                      <h4 className={styles.cardTitle}>Voucher toàn Shop</h4>
                      <p className={styles.cardDesc}>
                        Voucher áp dụng cho tất cả sản phẩm trong Shop của bạn
                      </p>
                    </div>
                  </div>
                  <div className={styles.cardBottom}>
                    <button
                      type="button"
                      className={styles.createBtn}
                      aria-label="Tạo Voucher toàn Shop"
                      onClick={() => handleOpenCreate(1)}
                    >
                      Tạo
                    </button>
                  </div>
                </div>

                <div className={styles.voucherCard}>
                  <div className={styles.cardTop}>
                    <div className={styles.cardIcon}>
                      <Package size={22} />
                    </div>
                    <div className={styles.cardInfo}>
                      <h4 className={styles.cardTitle}>Voucher sản phẩm</h4>
                      <p className={styles.cardDesc}>
                        Voucher chỉ áp dụng cho những sản phẩm nhất định mà Shop chọn
                      </p>
                    </div>
                  </div>
                  <div className={styles.cardBottom}>
                    <button
                      type="button"
                      className={styles.createBtn}
                      aria-label="Tạo Voucher sản phẩm"
                      onClick={() => handleOpenCreate(2)}
                    >
                      Tạo
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Collapsible content: Sections B & C */}
            {isLandingExpanded && (
              <>
                {/* Section B: Tập trung vào Kênh hiển thị Voucher */}
                <div className={styles.groupSection}>
                  <div className={styles.groupTitle}>Tập trung vào Kênh hiển thị Voucher</div>
                  <div className={styles.cardsGrid3}>
                    <div className={styles.voucherCard}>
                      <div className={styles.cardTop}>
                        <div className={styles.cardIcon}>
                          <Lock size={22} />
                        </div>
                        <div className={styles.cardInfo}>
                          <h4 className={styles.cardTitle}>Voucher riêng tư</h4>
                          <p className={styles.cardDesc}>
                            Voucher áp dụng cho nhóm Khách hàng Shop muốn thông qua mã Voucher
                          </p>
                        </div>
                      </div>
                      <div className={styles.cardBottom}>
                        <button
                          type="button"
                          className={styles.createBtn}
                          aria-label="Tạo Voucher riêng tư"
                          onClick={() => handleOpenCreate(5)}
                        >
                          Tạo
                        </button>
                      </div>
                    </div>

                    <div className={styles.voucherCard}>
                      <div className={styles.cardTop}>
                        <div className={styles.cardIcon}>
                          <Video size={22} />
                        </div>
                        <div className={styles.cardInfo}>
                          <h4 className={styles.cardTitle}>Voucher Shopee Live</h4>
                          <p className={styles.cardDesc}>
                            Voucher độc quyền áp dụng các sản phẩm trong livestream của Shop thúc đẩy chuyển đổi đơn...
                          </p>
                        </div>
                      </div>
                      <div className={styles.cardBottom}>
                        <button
                          type="button"
                          className={styles.createBtn}
                          aria-label="Tạo Voucher Shopee Live"
                          onClick={() => handleOpenCreate(6)}
                        >
                          Tạo
                        </button>
                      </div>
                    </div>

                    <div className={styles.voucherCard}>
                      <div className={styles.cardTop}>
                        <div className={styles.cardIcon}>
                          <PlayCircle size={22} />
                        </div>
                        <div className={styles.cardInfo}>
                          <h4 className={styles.cardTitle}>Voucher Shopee Video</h4>
                          <p className={styles.cardDesc}>
                            Voucher áp dụng độc quyền cho các sản phẩm trên Video của Shop để tăng doanh số bán hàng
                          </p>
                        </div>
                      </div>
                      <div className={styles.cardBottom}>
                        <button
                          type="button"
                          className={styles.createBtn}
                          aria-label="Tạo Voucher Shopee Video"
                          onClick={() => handleOpenCreate(7)}
                        >
                          Tạo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section C: Tập trung vào nhóm Khách hàng mục tiêu */}
                <div className={styles.groupSection}>
                  <div className={styles.groupTitle}>Tập trung vào nhóm Khách hàng mục tiêu</div>
                  <div className={styles.cardsGrid3}>
                    <div className={styles.voucherCard}>
                      <div className={styles.cardTop}>
                        <div className={styles.cardIcon}>
                          <UserPlus size={22} />
                        </div>
                        <div className={styles.cardInfo}>
                          <h4 className={styles.cardTitle}>Voucher Khách hàng mới</h4>
                          <p className={styles.cardDesc}>
                            Voucher nhằm thu hút Khách hàng mới và Khách hàng tiềm năng
                          </p>
                        </div>
                      </div>
                      <div className={styles.cardBottom}>
                        <button
                          type="button"
                          className={styles.createBtn}
                          aria-label="Tạo Voucher Khách hàng mới"
                          onClick={() => handleOpenCreate(3)}
                        >
                          Tạo
                        </button>
                      </div>
                    </div>

                    <div className={styles.voucherCard}>
                      <div className={styles.cardTop}>
                        <div className={styles.cardIcon}>
                          <Users size={22} />
                        </div>
                        <div className={styles.cardInfo}>
                          <h4 className={styles.cardTitle}>Voucher Khách hàng mua lại</h4>
                          <p className={styles.cardDesc}>
                            Voucher nhằm thu hút khách hàng mục tiêu có đơn mua lại tại Shop
                          </p>
                        </div>
                      </div>
                      <div className={styles.cardBottom}>
                        <button
                          type="button"
                          className={styles.createBtn}
                          aria-label="Tạo Voucher Khách hàng mua lại"
                          onClick={() => handleOpenCreate(4)}
                        >
                          Tạo
                        </button>
                      </div>
                    </div>

                    <div className={styles.voucherCard}>
                      <div className={styles.cardTop}>
                        <div className={styles.cardIcon}>
                          <HeartHandshake size={22} />
                        </div>
                        <div className={styles.cardInfo}>
                          <h4 className={styles.cardTitle}>Ưu đãi Follower</h4>
                          <p className={styles.cardDesc}>
                            Khuyến khích người mua theo dõi Shop bằng cách tặng Voucher cho người theo dõi mới
                          </p>
                        </div>
                      </div>
                      <div className={styles.cardBottom}>
                        <button
                          type="button"
                          className={styles.createBtn}
                          aria-label="Tạo Ưu đãi Follower"
                          onClick={() => handleOpenCreate(9)}
                        >
                          Tạo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Expand / Collapse Control */}
            <div className={styles.expandDivider}>
              <button
                type="button"
                className={styles.expandToggle}
                onClick={() => setIsLandingExpanded((v) => !v)}
              >
                {isLandingExpanded ? "Thu gọn" : "Mở rộng"}
                {isLandingExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          {/* State B: Voucher List Section */}
          <div className={styles.listCard}>
            <div className={styles.listHeader}>
              <h2 className={styles.listTitle}>Danh sách mã giảm giá</h2>
            </div>

            {/* Top-level Tabs */}
            <div className={styles.mainTabs}>
              <button
                type="button"
                className={`${styles.mainTab} ${activeMainTab === "list" ? styles.activeMainTab : ""}`}
                onClick={() => setActiveMainTab("list")}
              >
                Danh sách mã giảm giá
              </button>
              <button
                type="button"
                className={`${styles.mainTab} ${activeMainTab === "package" ? styles.activeMainTab : ""}`}
                onClick={() => setActiveMainTab("package")}
              >
                Voucher Package
              </button>
            </div>

            {activeMainTab === "package" ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#666" }}>
                <Ticket size={40} style={{ color: "#ee4d2d", marginBottom: 12 }} />
                <h3>Gói Voucher Package</h3>
                <p style={{ maxWidth: 500, margin: "8px auto 0", fontSize: 13, color: "#888" }}>
                  Chương trình gói Voucher tiếp thị giúp shop tiếp cận hàng triệu khách hàng tiềm năng trên toàn sàn.
                  Tính năng hiện đang được Shopee tối ưu hóa.
                </p>
              </div>
            ) : (
              <>
                {/* Status Sub-tabs */}
                <div className={styles.statusTabs}>
                  <button
                    type="button"
                    className={`${styles.statusTab} ${statusTab === "all" ? styles.activeStatusTab : ""}`}
                    onClick={() => {
                      setStatusTab("all");
                      setCurrentPage(1);
                    }}
                  >
                    Tất cả ({statusCounts.all})
                  </button>
                  <button
                    type="button"
                    className={`${styles.statusTab} ${statusTab === "ongoing" ? styles.activeStatusTab : ""}`}
                    onClick={() => {
                      setStatusTab("ongoing");
                      setCurrentPage(1);
                    }}
                  >
                    Đang diễn ra ({statusCounts.ongoing})
                  </button>
                  <button
                    type="button"
                    className={`${styles.statusTab} ${statusTab === "upcoming" ? styles.activeStatusTab : ""}`}
                    onClick={() => {
                      setStatusTab("upcoming");
                      setCurrentPage(1);
                    }}
                  >
                    Sắp diễn ra ({statusCounts.upcoming})
                  </button>
                  <button
                    type="button"
                    className={`${styles.statusTab} ${statusTab === "expired" ? styles.activeStatusTab : ""}`}
                    onClick={() => {
                      setStatusTab("expired");
                      setCurrentPage(1);
                    }}
                  >
                    Đã kết thúc ({statusCounts.expired})
                  </button>
                </div>

                {/* Search Toolbar */}
                <form className={styles.searchToolbar} onSubmit={handleSearchSubmit}>
                  <span className={styles.searchLabel}>Tìm kiếm</span>
                  <select
                    className={styles.searchSelect}
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                  >
                    <option value="voucher_name">Tên Voucher</option>
                    <option value="voucher_code">Mã voucher</option>
                  </select>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Input"
                    value={keywordDraft}
                    onChange={(e) => setKeywordDraft(e.target.value)}
                  />
                  <button type="submit" className={styles.searchSubmitBtn}>
                    Tìm
                  </button>
                  <button type="button" className={styles.searchResetBtn} onClick={handleSearchReset}>
                    Đặt lại
                  </button>
                </form>

                {error && <div className={styles.errorBanner}>{error}</div>}

                {/* Voucher Table */}
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Tên Voucher | Mã voucher</th>
                        <th style={{ minWidth: 150 }}>Loại mã</th>
                        <th style={{ minWidth: 130 }}>Sản phẩm áp dụng</th>
                        <th style={{ minWidth: 140 }}>Người mua mục tiêu</th>
                        <th style={{ minWidth: 120 }}>Giảm giá</th>
                        <th style={{ minWidth: 140 }}>Tổng lượt sử dụng tối đa</th>
                        <th style={{ minWidth: 90 }}>
                          Đã dùng <Info size={13} style={{ verticalAlign: "middle", color: "#999", cursor: "help" }} title="Tổng số lượt mã giảm giá đã được sử dụng thành công" />
                        </th>
                        <th style={{ minWidth: 100 }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={8} className={styles.loadingState}>
                            Đang tải danh sách mã giảm giá...
                          </td>
                        </tr>
                      ) : vouchers.length === 0 ? (
                        <tr>
                          <td colSpan={8} className={styles.emptyState}>
                            Không tìm thấy mã giảm giá phù hợp.
                          </td>
                        </tr>
                      ) : (
                        vouchers.map((v) => {
                          const isPercent = v.discount_percentage > 0;
                          const statusClass =
                            v.status === "ongoing"
                              ? styles.badgeOngoing
                              : v.status === "upcoming"
                              ? styles.badgeUpcoming
                              : styles.badgeExpired;
                          const statusText =
                            v.status === "ongoing"
                              ? "Đang diễn ra"
                              : v.status === "upcoming"
                              ? "Sắp diễn ra"
                              : "Đã kết thúc";

                          const meta = USECASE_DETAILS[v.usecase] || USECASE_DETAILS[1];
                          const RowIcon = meta.icon;

                          const targetLabel =
                            v.usecase === 3
                              ? "Người mua mới"
                              : v.usecase === 4
                              ? `Khách mua lại (${v.target_voucher === 3 ? "2+ đơn" : "1 đơn"})`
                              : v.usecase === 9
                              ? "Người theo dõi mới"
                              : "Tất cả Người mua";

                          return (
                            <tr key={v.voucher_id}>
                              {/* 1. Identity */}
                              <td>
                                <div className={styles.voucherIdentityCell}>
                                  <div className={styles.voucherIconThumb}>
                                    <RowIcon size={20} />
                                  </div>
                                  <div className={styles.voucherIdentityText}>
                                    <span className={`${styles.statusBadge} ${statusClass}`}>
                                      {statusText}
                                    </span>
                                    <span className={styles.voucherName} title={v.voucher_name}>
                                      {v.voucher_name}
                                    </span>
                                    <span className={styles.voucherCode}>
                                      Mã voucher: <strong>{v.voucher_code}</strong>
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* 2. Loại mã */}
                              <td>{meta.name}</td>

                              {/* 3. Sản phẩm áp dụng */}
                              <td>
                                {v.usecase === 2
                                  ? `${v.item_count || 1} sản phẩm`
                                  : "Tất cả sản phẩm"}
                              </td>

                              {/* 4. Người mua mục tiêu */}
                              <td>{targetLabel}</td>

                              {/* 5. Giảm giá */}
                              <td className={styles.discountText}>
                                {isPercent
                                  ? `${v.discount_percentage}% GIẢM`
                                  : formatMoney(v.discount_amount)}
                              </td>

                              {/* 6. Tổng lượt tối đa */}
                              <td>{v.usage_quantity || "—"}</td>

                              {/* 7. Đã dùng */}
                              <td>{v.current_usage || 0}</td>

                              {/* 8. Thao tác */}
                              <td>
                                <div className={styles.actionsCell}>
                                  <button
                                    type="button"
                                    className={styles.actionLink}
                                    onClick={() => setDetailModalVoucher(v)}
                                  >
                                    Chi tiết
                                  </button>
                                  <button
                                    type="button"
                                    className={styles.actionLink}
                                    onClick={() => setOrdersModalCode(v.voucher_code)}
                                  >
                                    Đơn hàng
                                  </button>
                                  <button
                                    type="button"
                                    className={styles.actionLink}
                                    onClick={() => handleOpenCopy(v)}
                                  >
                                    Sao chép
                                  </button>
                                  {v.status === "ongoing" && (
                                    <button
                                      type="button"
                                      className={`${styles.actionLink} ${styles.actionLinkDanger}`}
                                      onClick={() => handleEndVoucher(v)}
                                    >
                                      Kết thúc
                                    </button>
                                  )}
                                  {v.status === "upcoming" && (
                                    <button
                                      type="button"
                                      className={`${styles.actionLink} ${styles.actionLinkDanger}`}
                                      onClick={() => handleDeleteVoucher(v)}
                                    >
                                      Xóa
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <SellerPagination
                  currentPage={currentPage}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                />
              </>
            )}
          </div>
        </>
      ) : (
        /* State C: Voucher Creation & Edit Workflow */
        <form onSubmit={handleSubmitForm} className={styles.workflowContainer}>
          {formError && (
            <div className={styles.errorBanner}>
              <AlertCircle size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
              {formError}
            </div>
          )}

          {/* Card 1: Thông tin cơ bản */}
          <div className={styles.formCard}>
            <h3 className={styles.formCardTitle}>Thông tin cơ bản</h3>

            {/* Loại mã */}
            <div className={styles.formRow}>
              <div className={styles.formLabel}>Loại mã</div>
              <div className={styles.formControl}>
                <div className={styles.selectedTypeCard}>
                  <div className={styles.cardIcon} style={{ width: 34, height: 34 }}>
                    <UsecaseIcon size={18} />
                  </div>
                  <div>
                    <strong style={{ fontSize: 13, color: "#222" }}>{currentUsecaseMeta.name}</strong>
                    <div style={{ fontSize: 11, color: "#777" }}>{currentUsecaseMeta.desc}</div>
                  </div>
                  <div className={styles.selectedTypeBadge}>
                    <Check size={10} />
                  </div>
                </div>
              </div>
            </div>

            {/* Tên chương trình */}
            <div className={styles.formRow}>
              <div className={styles.formLabel}>
                <span className={styles.requiredStar}>*</span> Tên chương trình giảm giá
              </div>
              <div className={styles.formControl}>
                <div className={styles.inputWithCounter}>
                  <input
                    type="text"
                    className={styles.formInput}
                    maxLength={formUsecase === 9 ? 20 : 100}
                    placeholder={formUsecase === 9 ? "Nhập vào" : "Nhập tên chương trình..."}
                    value={formVoucherName}
                    onChange={(e) => setFormVoucherName(e.target.value)}
                  />
                  <span className={styles.charCounter}>
                    {formVoucherName.length}/{formUsecase === 9 ? 20 : 100}
                  </span>
                </div>
                <span className={styles.helperText}>
                  {formUsecase === 9
                    ? "Tên chương trình Ưu Đãi Follower sẽ không được hiển thị cho Người mua."
                    : "Tên Voucher sẽ không được hiển thị cho Người mua"}
                </span>
              </div>
            </div>

            {/* Mã voucher */}
            <div className={styles.formRow}>
              <div className={styles.formLabel}>
                <span className={styles.requiredStar}>*</span> Mã voucher
              </div>
              <div className={styles.formControl}>
                {formUsecase === 9 ? (
                  <span style={{ fontSize: 13, color: "#666", paddingTop: 8 }}>
                    Mã giảm giá sẽ được tự động gửi đi
                  </span>
                ) : formUsecase === 6 || formUsecase === 7 ? (
                  <div className={styles.orangeNotice} style={{ marginTop: 0 }}>
                    Mã voucher sẽ được hệ thống tạo tự động khi lưu chương trình theo tiêu chuẩn Shopee Live & Video.
                  </div>
                ) : (
                  <>
                    <div className={styles.codePrefixBox}>
                      <span className={styles.codePrefix}>{voucherConfig.prefix || "SMAR"}</span>
                      <input
                        type="text"
                        className={styles.codeSuffixInput}
                        maxLength={5}
                        placeholder="INPUT"
                        value={formCodeSuffix}
                        onChange={(e) => setFormCodeSuffix(e.target.value.toUpperCase())}
                      />
                    </div>
                    <span className={styles.helperText}>
                      Vui lòng chỉ nhập các kí tự chữ cái (A-Z), số (0-9); tối đa 5 kí tự.
                      <br />
                      Mã giảm giá đầy đủ là: <strong>{(voucherConfig.prefix || "SMAR") + formCodeSuffix}</strong>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Thời gian sử dụng */}
            <div className={styles.formRow}>
              <div className={styles.formLabel}>
                <span className={styles.requiredStar}>*</span> {formUsecase === 9 ? "Thời hạn nhận Voucher" : "Thời gian sử dụng mã"}
              </div>
              <div className={styles.formControl}>
                <div className={styles.dateTimeRow}>
                  <input
                    type="datetime-local"
                    className={styles.dateInput}
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                  />
                  <span>–</span>
                  <input
                    type="datetime-local"
                    className={styles.dateInput}
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                  />
                </div>
                {formUsecase !== 9 && (
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#555", marginTop: 6, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formDisplayTiming}
                      onChange={(e) => setFormDisplayTiming(e.target.checked)}
                      style={{ accentColor: "#ee4d2d" }}
                    />
                    Cho phép lưu mã trước Thời gian sử dụng
                  </label>
                )}
              </div>
            </div>

            {formUsecase === 9 && (
              <div className={styles.formRow}>
                <div className={styles.formLabel}>Ngày Hết hạn</div>
                <div className={styles.formControl}>
                  <span style={{ fontSize: 13, color: "#333", fontWeight: 500, paddingTop: 8 }}>
                    7 ngày kể từ lúc Voucher được lưu vào Kho Voucher
                  </span>
                </div>
              </div>
            )}

            {/* Targeting conditions for New / Returning Buyer */}
            {formUsecase === 3 && (
              <div className={styles.formRow}>
                <div className={styles.formLabel}>Đối tượng áp dụng</div>
                <div className={styles.formControl}>
                  <div className={styles.orangeNotice} style={{ marginTop: 0 }}>
                    Voucher Khách hàng mới chỉ áp dụng cho Người mua chưa từng có đơn hàng hoàn thành nào tại Shop.
                  </div>
                </div>
              </div>
            )}

            {formUsecase === 4 && (
              <div className={styles.formRow}>
                <div className={styles.formLabel}>Tiêu chí khách mua lại</div>
                <div className={styles.formControl}>
                  <div className={styles.radioGroup}>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="targetVoucher"
                        checked={formTargetVoucher === 2}
                        onChange={() => setFormTargetVoucher(2)}
                      />
                      Người mua đã có 1 đơn hàng
                    </label>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="targetVoucher"
                        checked={formTargetVoucher === 3}
                        onChange={() => setFormTargetVoucher(3)}
                      />
                      Người mua đã có 2 đơn hàng trở lên
                    </label>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <span style={{ fontSize: 13, color: "#666" }}>Trong khoảng thời gian:</span>
                    <select
                      className={styles.formInput}
                      style={{ width: 140, height: 34 }}
                      value={formLookbackDays}
                      onChange={(e) => setFormLookbackDays(Number(e.target.value))}
                    >
                      <option value={30}>30 ngày qua</option>
                      <option value={60}>60 ngày qua</option>
                      <option value={90}>90 ngày qua</option>
                      <option value={180}>180 ngày qua</option>
                      <option value={365}>365 ngày qua</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Thiết lập mã giảm giá */}
          <div className={styles.formCard}>
            <h3 className={styles.formCardTitle}>Thiết lập mã giảm giá</h3>

            {/* Benefit type */}
            <div className={styles.formRow}>
              <div className={styles.formLabel}>Loại Voucher</div>
              <div className={styles.formControl}>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="rewardType"
                      checked={formRewardType === 1}
                      onChange={() => setFormRewardType(1)}
                    />
                    Khuyến Mãi
                  </label>
                  <label
                    className={`${styles.radioLabel} ${styles.radioLabelDisabled}`}
                    title="Tính năng Hoàn Xu hiện chưa được hỗ trợ trên hệ thống"
                  >
                    <input
                      type="radio"
                      name="rewardType"
                      checked={false}
                      disabled
                    />
                    Hoàn Xu (Chưa hỗ trợ)
                  </label>
                </div>
              </div>
            </div>

            {/* Discount type & amount */}
            <div className={styles.formRow}>
              <div className={styles.formLabel}>
                <span className={styles.requiredStar}>*</span> Loại giảm giá | Mức giảm
              </div>
              <div className={styles.formControl}>
                <div className={styles.amountGroup}>
                  <select
                    className={styles.formInput}
                    style={{ width: 140 }}
                    value={formDiscountType}
                    onChange={(e) => setFormDiscountType(e.target.value)}
                  >
                    <option value="amount">Theo số tiền</option>
                    <option value="percent">Theo phần trăm</option>
                  </select>

                  {formDiscountType === "amount" ? (
                    <div className={styles.currencyInputWrapper}>
                      <span className={styles.currencyPrefix}>₫</span>
                      <input
                        type="number"
                        className={styles.currencyInput}
                        min={1000}
                        step={1000}
                        placeholder={formUsecase === 9 ? "Nhập vào" : ""}
                        value={formDiscountAmount}
                        onChange={(e) => setFormDiscountAmount(Number(e.target.value))}
                      />
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input
                        type="number"
                        className={styles.formInput}
                        style={{ width: 80 }}
                        min={1}
                        max={99}
                        placeholder={formUsecase === 9 ? "Nhập vào" : ""}
                        value={formDiscountPercent}
                        onChange={(e) => setFormDiscountPercent(Number(e.target.value))}
                      />
                      <span style={{ fontSize: 13, color: "#666" }}>% GIẢM</span>
                    </div>
                  )}
                </div>

                {formUsecase === 9 && (
                  <span className={styles.helperText} style={{ marginTop: 6, display: "block" }}>
                    Những mã Voucher hấp dẫn sẽ thu hút thêm nhiều khách và tăng lượng theo dõi cho Shop bạn.
                  </span>
                )}

                {formDiscountType === "percent" && (
                  <div style={{ marginTop: 8 }}>
                    <div className={styles.radioGroup}>
                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          name="hasMaxPrice"
                          checked={!formHasMaxPrice}
                          onChange={() => setFormHasMaxPrice(false)}
                        />
                        Không giới hạn
                      </label>
                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          name="hasMaxPrice"
                          checked={formHasMaxPrice}
                          onChange={() => setFormHasMaxPrice(true)}
                        />
                        Đặt mức giảm tối đa
                      </label>
                    </div>
                    {formHasMaxPrice && (
                      <div className={styles.currencyInputWrapper} style={{ marginTop: 8 }}>
                        <span className={styles.currencyPrefix}>₫</span>
                        <input
                          type="number"
                          className={styles.currencyInput}
                          min={1000}
                          step={1000}
                          value={formMaxPrice}
                          onChange={(e) => setFormMaxPrice(Number(e.target.value))}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Minimum Basket Price */}
            <div className={styles.formRow}>
              <div className={styles.formLabel}>
                <span className={styles.requiredStar}>*</span> Giá trị đơn hàng tối thiểu
              </div>
              <div className={styles.formControl}>
                <div className={styles.currencyInputWrapper}>
                  <span className={styles.currencyPrefix}>₫</span>
                  <input
                    type="number"
                    className={styles.currencyInput}
                    min={0}
                    step={1000}
                    placeholder={formUsecase === 9 ? "Nhập vào" : ""}
                    value={formMinBasketPrice}
                    onChange={(e) => setFormMinBasketPrice(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Usage Quantity */}
            <div className={styles.formRow}>
              <div className={styles.formLabel}>
                <span className={styles.requiredStar}>*</span> Tổng lượt sử dụng tối đa
              </div>
              <div className={styles.formControl}>
                <input
                  type="number"
                  className={styles.formInput}
                  style={{ width: 180 }}
                  min={1}
                  placeholder={formUsecase === 9 ? "Nhập vào" : ""}
                  value={formUsageQuantity}
                  onChange={(e) => setFormUsageQuantity(Number(e.target.value))}
                />
                <span className={styles.helperText}>
                  {formUsecase === 9 ? "Tổng số lượt sử dụng mã tối đa" : "Tổng số Mã giảm giá có thể sử dụng"}
                </span>
              </div>
            </div>

            {/* Max per buyer */}
            {formUsecase !== 9 && (
              <div className={styles.formRow}>
                <div className={styles.formLabel}>Lượt sử dụng tối đa/Người mua</div>
                <div className={styles.formControl}>
                  <input
                    type="number"
                    className={styles.formInput}
                    style={{ width: 180 }}
                    min={1}
                    value={formMaxPerBuyer}
                    onChange={(e) => setFormMaxPerBuyer(Number(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Hiển thị mã giảm giá và các sản phẩm áp dụng */}
          <div className={styles.formCard}>
            <h3 className={styles.formCardTitle}>Hiển thị mã giảm giá và các sản phẩm áp dụng</h3>

            {/* Thiết lập hiển thị */}
            {formUsecase !== 9 && (
              <div className={styles.formRow}>
                <div className={styles.formLabel}>Thiết lập hiển thị</div>
                <div className={styles.formControl}>
                  {formUsecase === 5 ? (
                    <div className={styles.radioGroup}>
                      <label className={styles.radioLabel}>
                        <input type="radio" checked readOnly />
                        Chia sẻ thông qua mã Voucher (Riêng tư)
                      </label>
                    </div>
                  ) : (
                    <div className={styles.radioGroup}>
                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          name="displayChannel"
                          checked={formDisplayChannel === "all"}
                          onChange={() => setFormDisplayChannel("all")}
                        />
                        Hiển thị nhiều nơi <Info size={13} style={{ color: "#999" }} title="Hiển thị trên trang chủ Shop, chi tiết sản phẩm, giỏ hàng" />
                      </label>
                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          name="displayChannel"
                          checked={formDisplayChannel === "private"}
                          onChange={() => setFormDisplayChannel("private")}
                        />
                        Chia sẻ thông qua mã Voucher <Info size={13} style={{ color: "#999" }} title="Chỉ những người nhận được mã voucher mới có thể áp dụng" />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sản phẩm được áp dụng */}
            <div className={styles.formRow}>
              <div className={styles.formLabel}>Sản phẩm được áp dụng</div>
              <div className={styles.formControl}>
                {formUsecase === 9 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, paddingTop: 4 }}>
                    <strong style={{ fontSize: 13, color: "#222" }}>Tất cả sản phẩm</strong>
                    <Info size={14} style={{ color: "#999", cursor: "help" }} title="Áp dụng cho toàn bộ sản phẩm đang hoạt động của Shop" />
                  </div>
                ) : formUsecase !== 2 ? (
                  <>
                    <strong style={{ fontSize: 13, color: "#222" }}>Tất cả sản phẩm</strong>
                    <div className={styles.orangeNotice}>
                      Trong các sản phẩm đã chọn có một số sản phẩm không được chạy khuyến mãi theo quy định của pháp luật hoặc đây là sản phẩm độc quyền dành cho thành viên.
                      <a
                        href="#learn-products"
                        style={{ color: "#0b66c3", marginLeft: 4, textDecoration: "none" }}
                        onClick={(e) => {
                          e.preventDefault();
                          alert("Tìm hiểu thêm về chính sách sản phẩm được áp dụng mã giảm giá tại Quy định Shopee.");
                        }}
                      >
                        Tìm hiểu thêm
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={styles.addProductBtn}
                      aria-label="Thêm sản phẩm"
                      onClick={() => setProductSelectOpen(true)}
                    >
                      <Plus size={16} /> Thêm sản phẩm
                    </button>

                    {formSelectedItems.length > 0 ? (
                      <>
                        <div style={{ fontSize: 13, color: "#666", marginTop: 10 }}>
                          <strong>{formSelectedItems.length}</strong> Sản phẩm được chọn
                        </div>
                        <table className={styles.selectedProductsTable}>
                          <thead>
                            <tr>
                              <th>Sản phẩm</th>
                              <th style={{ width: 140 }}>Original Price</th>
                              <th style={{ width: 110 }}>
                                Số Lượng Hàng <Info size={13} style={{ verticalAlign: "middle", color: "#999" }} />
                              </th>
                              <th style={{ width: 80 }}>Hoạt động</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formSelectedItems.map((it) => (
                              <tr key={it.item_id}>
                                <td>
                                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    {it.image && (
                                      <img
                                        src={it.image}
                                        alt=""
                                        style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4 }}
                                      />
                                    )}
                                    <div style={{ minWidth: 0 }}>
                                      <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280 }}>
                                        {it.item_name}
                                      </div>
                                      <small style={{ color: "#888" }}>Mã: {it.item_id}</small>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ color: "#ee4d2d", fontWeight: 600 }}>{formatMoney(it.price)}</td>
                                <td>{it.stock ?? 50}</td>
                                <td>
                                  <button
                                    type="button"
                                    className={styles.removeProductBtn}
                                    title="Xóa sản phẩm"
                                    onClick={() =>
                                      setFormSelectedItems((prev) =>
                                        prev.filter((item) => String(item.item_id) !== String(it.item_id))
                                      )
                                    }
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    ) : (
                      <span className={styles.helperText} style={{ marginTop: 8 }}>
                        Chưa chọn sản phẩm nào. Vui lòng bấm <strong>+ Thêm sản phẩm</strong> để chọn.
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className={styles.bottomActionBar}>
            <button
              type="button"
              className={styles.cancelActionBtn}
              onClick={() => setViewMode("list")}
              disabled={formSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.submitActionBtn}
              disabled={formSubmitting}
            >
              {formSubmitting ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </div>
        </form>
      )}

      {/* Product Select Modal for Product Vouchers */}
      <ProductSelectModal
        isOpen={productSelectOpen}
        shopId={activeShopId}
        initialSelectedItems={formSelectedItems}
        onClose={() => setProductSelectOpen(false)}
        onConfirm={(selectedList) => setFormSelectedItems(selectedList)}
      />

      {/* Voucher Detail Modal */}
      <VoucherDetailModal
        isOpen={Boolean(detailModalVoucher)}
        voucher={detailModalVoucher}
        onClose={() => setDetailModalVoucher(null)}
      />

      {/* Voucher Orders Modal */}
      <VoucherOrdersModal
        isOpen={Boolean(ordersModalCode)}
        shopId={activeShopId}
        voucherCode={ordersModalCode}
        onClose={() => setOrdersModalCode(null)}
      />
    </div>
  );
}
