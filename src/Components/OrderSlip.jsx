// src/Components/OrderSlip.jsx
import React, { forwardRef } from "react";

const OrderSlip = forwardRef(function OrderSlip({ order }, ref) {
  if (!order) return null;

  const createdAt = order.createdAt?.toDate
    ? order.createdAt.toDate()
    : new Date();

  return (
    <div
      ref={ref}
      className="slip-root bg-white text-black p-4"
      style={{
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
        width: "80mm", // receipt width
        fontSize: "11px",
      }}
    >
      {/* Header */}
      <div className="text-center mb-2">
        <p className="font-bold text-sm uppercase">
          Majestic Shoe Palace
        </p>
        <p>197, Main Street, Kegalle</p>
        <p>Tel: 074 303 5311</p>
      </div>

      <hr className="border-gray-300 my-2" />

      {/* Order info */}
      <div className="mb-2">
        <p>Order: {order.id?.slice(0, 8)}</p>
        <p>
          Date: {createdAt.toLocaleDateString()}{" "}
          {createdAt.toLocaleTimeString()}
        </p>
        <p>Customer: {order.userEmail || order.userId}</p>
      </div>

      <hr className="border-gray-300 my-2" />

      {/* Items */}
      <div className="mb-2">
        {order.items?.map((item, idx) => {
          const price = Number(item.price) || 0;
          const qty = item.quantity || 1;
          const sub = price * qty;
          return (
            <div key={idx} className="mb-1">
              <p className="font-semibold">
                {idx + 1}. {item.name}
              </p>
              <p className="flex justify-between">
                <span>
                  {item.size && `Size ${item.size}`}{" "}
                  {item.color && `• ${item.color}`}
                </span>
                <span>
                  {qty} x {price.toLocaleString("en-LK")}
                </span>
              </p>
              <p className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {sub.toLocaleString("en-LK")}</span>
              </p>
            </div>
          );
        })}
      </div>

      <hr className="border-gray-300 my-2" />

      {/* Totals */}
      <div className="mb-2">
        <p className="flex justify-between font-semibold">
          <span>Total</span>
          <span>
            Rs. {Number(order.total || 0).toLocaleString("en-LK")}
          </span>
        </p>
        <p className="text-xs mt-1">Delivery: Complimentary</p>
      </div>

      <hr className="border-gray-300 my-2" />

      <p className="text-center text-[10px] mt-2">
        Thank you for shopping with us.
      </p>
    </div>
  );
});

export default OrderSlip;
