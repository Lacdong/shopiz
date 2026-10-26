export const DEFAULT_QUICK_REPLY_GROUPS = [
  {
    id: "group-common-1",
    name: "Nhóm Tin nhắn chung",
    enabled: true,
    expanded: true,
    messages: [
      { id: "msg-1", content: "Sản phẩm có sẵn", enabled: true, order: 1 },
      { id: "msg-2", content: "Cám ơn bạn!", enabled: true, order: 2 },
      { id: "msg-3", content: "Cảm ơn bạn đã mua hàng! Shop sẽ đóng gói và giao hàng cho đơn vị vận chuyển trong thời gian sớm nhất", enabled: true, order: 3 },
      { id: "msg-4", content: "Đơn hàng của bạn đã được giao cho đơn vị vận chuyển. Bạn có thể kiểm tra hành trình của đơn hàng tại mục \"Tôi > Đang giao\"", enabled: true, order: 4 },
      { id: "msg-5", content: "Đơn hàng của bạn đã được bàn giao cho đơn vị vận chuyển và sẽ sớm được giao đến bạn!\"Theo dõi\" để lấy được nhiều mã giảm giá và nhận tin khuyến mãi mới nhất nhé. Cám ơn bạn vì đã mua hàng của shop!", enabled: true, order: 5 },
      { id: "msg-6", content: "Hãy theo dõi Shop ngay để không bỏ lỡ những ưu đãi mới nhất bạn nhé", enabled: true, order: 6 },
      { id: "msg-7", content: "Sản phẩm này có thể áp dụng voucher giảm giá", enabled: true, order: 7 },
      { id: "msg-8", content: "Shop rất tiếc không thể giảm giá thêm vì sản phẩm đang ở mức giá thấp nhất", enabled: true, order: 8 },
      { id: "msg-9", content: "Bạn đang quan tâm sản phẩm này? Bạn có thể đặt hàng ngay bây giờ để đơn hàng được giao đến cho bạn sớm nhé.", enabled: true, order: 9 },
      { id: "msg-10", content: "Hãy cung cấp thêm chiều cao và cân nặng để Shop tư vấn cho bạn nhé", enabled: true, order: 10 },
      { id: "msg-11", content: "Hãy cung cấp mã vận đơn để Shop kiểm tra cho bạn nhé", enabled: true, order: 11 },
      { id: "msg-12", content: "Shop nhận thấy bạn vừa Hủy/Trả hàng/Hoàn tiền đơn hàng. Bạn có thể cho Shop biết là bạn gặp vấn đề gì với đơn hàng này không?", enabled: true, order: 12 },
      { id: "msg-13", content: "Shop rất tiếc về trải nghiệm chưa tốt của bạn và rất mong được nhận hình ảnh/video sản phẩm để kiểm tra. Chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất. Xin cảm ơn!", enabled: true, order: 13 }
    ]
  }
];

export const DEFAULT_AUTO_REPLY = {
  standard_enabled: false,
  standard_message: "Cảm ơn bạn đã nhắn tin cho shop. Shop sẽ phản hồi lại cho bạn trong vòng 30', bạn vui lòng chờ shop 1 tẹo nhé.",
  off_work_enabled: false,
  off_work_message: "Cảm ơn bạn đã quan tâm đến sản phẩm của shop. Shop sẽ phản hồi thông tin này trong giờ làm việc sớm nhất có thể."
};
