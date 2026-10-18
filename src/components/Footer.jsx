import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Linkedin,
  ShoppingBag,
  ArrowUpRight,
} from "lucide-react";
import s from "./Footer.module.css";
const groups = [
  [
    "Customer Service",
    "Help Center",
    "How to Buy",
    "Payment & Shipping",
    "Returns & Refunds",
    "Contact Us",
  ],
  [
    "About Shopiz",
    "Our Story",
    "Careers",
    "Privacy Policy",
    "Terms of Service",
    "Seller Center",
  ],
];
export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        <div className={s.top}>
          <div className={s.intro}>
            <Link to="/" className={s.logo}>
              <ShoppingBag size={27} strokeWidth={1.4} />
              shopiz.
            </Link>
            <p>
              A little more discovery.
              <br />A little more everyday.
            </p>
            <span>
              An independent marketplace simulator
              <br />
              developed for SmartOmni.
            </span>
          </div>
          {groups.map((group) => (
            <div className={s.group} key={group[0]}>
              <h3>{group[0]}</h3>
              {group.slice(1).map((label) => (
                <Link
                  key={label}
                  to={
                    label === "Seller Center"
                      ? "/seller"
                      : `/info/${label.toLowerCase().replaceAll(" ", "-")}`
                  }
                >
                  {label}
                </Link>
              ))}
            </div>
          ))}
          <div className={s.group}>
            <h3>Payment Methods</h3>
            <div className={s.payments}>
              <span>VISA</span>
              <span>Mastercard</span>
              <span>PayPal</span>
              <span>Apple Pay</span>
            </div>
            <h3 className={s.shippingTitle}>Shipping Partners</h3>
            <div className={s.partners}>
              <span>DHL</span>
              <span>FedEx</span>
              <span>UPS</span>
            </div>
          </div>
          <div className={s.group}>
            <h3>Follow Us</h3>
            {[
              [Instagram, "Instagram"],
              [Facebook, "Facebook"],
              [Linkedin, "LinkedIn"],
            ].map(([Icon, name]) => (
              <Link key={name} to={`/social/${name.toLowerCase()}`}>
                <Icon size={13} />
                {name}
                <ArrowUpRight size={11} />
              </Link>
            ))}
          </div>
        </div>
        <div className={s.bottom}>
          <span>© {new Date().getFullYear()} Shopiz. All rights reserved.</span>
          <span>
            Country & Region: Vietnam <i /> English <i /> Prices in USD
          </span>
        </div>
        <p className={s.disclaimer}>
          Shopiz is an independent e-commerce simulator. All products, prices,
          brands, payment and delivery options shown are for demonstration only.
          No purchases or payments are processed. Not affiliated with Shopee.
        </p>
      </div>
    </footer>
  );
}
