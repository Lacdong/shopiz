import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Construction, ArrowLeft, PackageCheck } from "lucide-react";
import s from "./SellerComingSoon.module.css";

export default function SellerComingSoon({ featureName = "Tính năng này", groupName = "" }) {
  const [params] = useSearchParams();
  const shopId = params.get("shop_id") || "";

  const backLink = `/seller?tab=orders_all${shopId ? `&shop_id=${shopId}` : ""}`;

  return (
    <div className={s.container}>
      <div className={s.card}>
        <div className={s.iconWrap}>
          <Construction size={48} strokeWidth={1.5} className={s.icon} />
        </div>
        <div className={s.badge}>KÊNH NGƯỜI BÁN SHOPEE</div>
        <h1 className={s.title}>{featureName}</h1>
        {groupName && <p className={s.groupText}>Thuộc phân mục: <strong>{groupName}</strong></p>}
        <p className={s.description}>
          Tính năng này đang trong quá trình tích hợp với hệ thống mô phỏng Shopee Open API v2.
          Dữ liệu và giao diện quản trị đầy đủ sẽ sẵn sàng trong các bản cập nhật sắp tới.
        </p>
        <div className={s.actions}>
          <Link to={backLink} className={s.primaryBtn}>
            <ArrowLeft size={16} /> Quay lại Quản Lý Đơn Hàng
          </Link>
        </div>
      </div>
    </div>
  );
}
