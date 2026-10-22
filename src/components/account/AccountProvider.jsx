import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { sampleAddresses, validateAddress } from "../../data/addresses";
import addressService from "../../services/addressService";
import authService, { getNumericBuyerId } from "../../services/authService";

const Context = createContext(null);
const fields = [
  "name",
  "email",
  "phone",
  "gender",
  "day",
  "month",
  "year",
  "avatar",
];

export function validBirthday(profile) {
  const { day, month, year } = profile;
  if (!day && !month && !year) return true;
  if (!day || !month || !year) return false;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return (
    Number(year) >= 1900 &&
    date <= now &&
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)
  );
}

function defaults(user) {
  return {
    profile: {
      name: user?.name || "Guest Shopper",
      email: user?.email || "guest@shopiz.com",
      phone: user?.phone || "0901234567",
      gender: "",
      day: "",
      month: "",
      year: "",
      avatar: user?.avatar || "",
    },
    addresses: sampleAddresses.map((address) => ({
      ...address,
      name: user?.name || "Guest Shopper",
      phone: user?.phone || address.phone,
    })),
  };
}

function read(user) {
  const base = defaults(user);
  try {
    const stored = JSON.parse(
      localStorage.getItem(`shopiz-account-v1:${user?.id || "guest"}`) ||
        "null",
    );
    if (!stored || typeof stored !== "object") return base;
    const profile = { ...base.profile };
    for (const key of fields)
      if (typeof stored.profile?.[key] === "string")
        profile[key] = stored.profile[key];
    if (!profile.name.trim() || profile.name.length > 80)
      profile.name = base.profile.name;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email))
      profile.email = base.profile.email;
    if (!/^\+?\d{9,15}$/.test(profile.phone.replace(/[\s().-]/g, "")))
      profile.phone = base.profile.phone;
    if (!["", "male", "female", "other"].includes(profile.gender))
      profile.gender = "";
    if (!validBirthday(profile))
      Object.assign(profile, { day: "", month: "", year: "" });
    if (
      !/^data:image\/(png|jpeg);base64,/.test(profile.avatar) &&
      !profile.avatar.startsWith("http") &&
      !profile.avatar.startsWith("/uploads")
    )
      profile.avatar = "";
    let addresses = base.addresses;
    if (Array.isArray(stored.addresses)) {
      addresses = stored.addresses
        .filter(
          (address) =>
            address &&
            [
              "id",
              "name",
              "phone",
              "street",
              "ward",
              "district",
              "city",
              "label",
            ].every((key) => typeof address[key] === "string") &&
            !Object.keys(validateAddress(address)).length,
        )
        .slice(0, 20)
        .filter(
          (address, index, list) =>
            list.findIndex((item) => item.id === address.id) === index,
        );
      const defaultId = (
        addresses.find((address) => address.isDefault) || addresses[0]
      )?.id;
      addresses = addresses.map((address) => ({
        ...address,
        isDefault: address.id === defaultId,
      }));
    }
    return { profile, addresses };
  } catch {
    return base;
  }
}

export function AccountProvider({ children }) {
  const { user } = useAuth();
  const owner = user?.id || "guest";
  const buyerId = getNumericBuyerId(user?.id);
  const [records, setRecords] = useState({});
  const [failures, setFailures] = useState({});

  const account = useMemo(
    () => records[owner] || read(user),
    [records, owner, user],
  );

  // Sync addresses from backend when user is logged in
  useEffect(() => {
    if (!user) return;
    addressService
      .getAddresses(buyerId)
      .then((serverAddrs) => {
        if (serverAddrs && serverAddrs.length) {
          const mapped = serverAddrs.map((a) => ({
            id: String(a.id),
            name: a.recipient_name,
            phone: a.recipient_phone,
            street: a.address_line,
            ward: a.ward || "",
            district: a.district || "",
            city: a.city || "",
            label: a.state || (a.is_default ? "Default" : "Home"),
            isDefault: Boolean(a.is_default),
          }));
          setRecords((curr) => {
            const existing = curr[owner] || read(user);
            return {
              ...curr,
              [owner]: {
                ...existing,
                addresses: mapped,
              },
            };
          });
        }
      })
      .catch(() => {
        // Backend unavailable
      });
  }, [user, owner, buyerId]);

  function commit(next) {
    setRecords((current) => ({ ...current, [owner]: next }));
    try {
      localStorage.setItem(`shopiz-account-v1:${owner}`, JSON.stringify(next));
      setFailures((current) => ({ ...current, [owner]: false }));
    } catch {
      setFailures((current) => ({ ...current, [owner]: true }));
    }
  }

  function saveProfile(profile) {
    commit({ ...account, profile });
    if (user) {
      authService
        .updateProfile(buyerId, {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          avatarUrl: profile.avatar,
        })
        .catch(() => {});
    }
  }

  function saveAddress(address) {
    const isNew = !account.addresses.some((item) => item.id === address.id);
    if (isNew && account.addresses.length >= 20) return false;
    const next = isNew
      ? [...account.addresses, address]
      : account.addresses.map((item) =>
          item.id === address.id ? address : item,
        );
    const defaultId =
      address.isDefault || next.length === 1
        ? address.id
        : (next.find((item) => item.isDefault) || next[0]).id;

    const normalizedAddresses = next.map((item) => ({
      ...item,
      isDefault: item.id === defaultId,
    }));

    commit({
      ...account,
      addresses: normalizedAddresses,
    });

    // Sync to backend in background
    if (user) {
      if (isNew) {
        addressService.createAddress(buyerId, address).catch(() => {});
      } else {
        addressService.updateAddress(address.id, address).catch(() => {});
      }
    }

    return true;
  }

  function removeAddress(id) {
    const next = account.addresses.filter((item) => item.id !== id);
    const defaultId = (next.find((item) => item.isDefault) || next[0])?.id;
    commit({
      ...account,
      addresses: next.map((item) => ({
        ...item,
        isDefault: item.id === defaultId,
      })),
    });

    if (user) {
      addressService.deleteAddress(id).catch(() => {});
    }
  }

  function setDefaultAddress(id) {
    if (account.addresses.some((item) => item.id === id)) {
      commit({
        ...account,
        addresses: account.addresses.map((item) => ({
          ...item,
          isDefault: item.id === id,
        })),
      });

      if (user) {
        addressService.setDefaultAddress(id).catch(() => {});
      }
    }
  }

  return (
    <Context.Provider
      value={{
        ...account,
        username: user?.username || "guest",
        storageError: Boolean(failures[owner]),
        saveProfile,
        saveAddress,
        removeAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export const useAccount = () => useContext(Context);
