import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  UserRound,
  Pencil,
  Bell,
  ClipboardList,
  Ticket,
  Coins,
} from "lucide-react";
import { useAccount } from "./AccountProvider";
import s from "./AccountSidebar.module.css";
export default function AccountSidebar() {
  const { profile } = useAccount();
  const { pathname } = useLocation();
  const expanded =
    pathname === "/account/profile" || pathname === "/account/addresses";
  return (
    <aside className={s.sidebar} aria-label="Account navigation">
      <div className={s.profile}>
        <span className={s.avatar}>
          {profile.avatar ? (
            <img src={profile.avatar} alt="Profile avatar" />
          ) : (
            <UserRound size={23} />
          )}
        </span>
        <div>
          <strong>{profile.name}</strong>
          <Link to="/account/profile">
            <Pencil size={11} />
            Edit Profile
          </Link>
        </div>
      </div>
      <nav aria-label="Account sections">
        <Link to="/notifications">
          <Bell size={17} />
          Notifications
        </Link>
        <div className={s.accountGroup}>
          <Link to="/account/profile" className={expanded ? s.selected : ""}>
            <UserRound size={17} />
            My Account
          </Link>
          {expanded && (
            <div className={s.subnav}>
              <Link
                to="/account/profile"
                aria-current={
                  pathname === "/account/profile" ? "page" : undefined
                }
              >
                Profile
              </Link>
              <Link
                to="/account/addresses"
                aria-current={
                  pathname === "/account/addresses" ? "page" : undefined
                }
              >
                Addresses
              </Link>
            </div>
          )}
        </div>
        <Link
          to="/account/purchases"
          aria-current={pathname === "/account/purchases" ? "page" : undefined}
        >
          <ClipboardList size={17} />
          My Purchases
        </Link>
        <Link to="/vouchers">
          <Ticket size={17} />
          My Vouchers
        </Link>
        <Link to="/info/coins">
          <Coins size={17} />
          Shopiz Coins
        </Link>
      </nav>
    </aside>
  );
}
