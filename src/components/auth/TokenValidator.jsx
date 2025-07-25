import React from "react";
import { useTokenValidator } from "../../hooks/useTokenValidator";
import SimpleTokenExpiredModal from "./SimpleTokenExpiredModal";

/**
 * Component wrapper để kiểm tra token và hiển thị modal khi hết hạn
 * Sử dụng component này bọc quanh các route cần bảo vệ
 */
const TokenValidator = ({ children }) => {
  const { showExpiredModal, handleConfirmExpired } = useTokenValidator();

  return (
    <>
      {children}
      <SimpleTokenExpiredModal
        isOpen={showExpiredModal}
        onConfirm={handleConfirmExpired}
      />
    </>
  );
};

export default TokenValidator;
