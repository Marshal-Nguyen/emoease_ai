# Token Management System

Hệ thống quản lý token tự động kiểm tra tính hợp lệ của JWT token và thông báo khi token hết hạn.

## Các tính năng

### 1. Kiểm tra Token Tự động

- Kiểm tra token mỗi 2 phút một lần
- Decode và validate JWT token
- Tự động dừng kiểm tra khi token hết hạn

### 2. Popup Thông báo

- Hiển thị popup đẹp mắt khi token hết hạn
- Animation mượt mà với Framer Motion
- Thiết kế responsive và user-friendly

### 3. Chuyển hướng Tự động

- Tự động xóa credentials khi token hết hạn
- Chuyển hướng về trang chủ sau khi xác nhận
- Đồng bộ với Redux store

## Cách sử dụng

### 1. Tích hợp vào ứng dụng

Token validation đã được tích hợp vào `App.jsx` thông qua component `TokenValidator`:

```jsx
import TokenValidator from "./components/auth/TokenValidator";

function App() {
  return (
    <TokenValidator>
      <Router>{/* Your routes here */}</Router>
    </TokenValidator>
  );
}
```

### 2. Sử dụng Hook riêng lẻ

```jsx
import { useTokenValidator } from "../hooks/useTokenValidator";

const MyComponent = () => {
  const { showExpiredModal, handleConfirmExpired, isTokenValid } =
    useTokenValidator();

  // Your component logic
};
```

### 3. Kiểm tra token thủ công

```jsx
import {
  isTokenExpired,
  getTokenTimeRemaining,
  getTokenInfo,
} from "../util/auth/tokenManager";

// Kiểm tra token có hết hạn không
const expired = isTokenExpired(token);

// Lấy thời gian còn lại (milliseconds)
const timeLeft = getTokenTimeRemaining(token);

// Lấy thông tin từ token
const tokenData = getTokenInfo(token);
```

## Cấu trúc File

```
src/
├── components/auth/
│   ├── TokenValidator.jsx          # Component wrapper chính
│   ├── TokenExpiredModal.jsx       # Modal thông báo
│   └── TokenManagerDemo.jsx        # Component demo
├── hooks/
│   └── useTokenValidator.js        # Hook quản lý token
├── util/auth/
│   └── tokenManager.js            # Utilities cho token
└── pages/Test/
    └── TokenDemoPage.jsx          # Trang demo
```

## Tùy chỉnh

### Thay đổi khoảng thời gian kiểm tra

```jsx
// Kiểm tra mỗi 5 phút
const { showExpiredModal } = useTokenValidator(5 * 60 * 1000);
```

### Tùy chỉnh hành động khi token hết hạn

Sửa đổi function `handleConfirmExpired` trong hook để thay đổi hành vi:

```jsx
const handleConfirmExpired = () => {
  setShowExpiredModal(false);
  dispatch(clearCredentials());

  // Tùy chỉnh chuyển hướng
  window.location.href = "/login"; // Thay vì '/'
};
```

## Demo

Truy cập `/token-demo` để xem demo và test các tính năng.

## Yêu cầu

- React 18+
- Redux Toolkit
- JWT Decode package
- Framer Motion (cho animation)
- Tailwind CSS (cho styling)

## Lưu ý

- Token validator chạy trên toàn bộ ứng dụng
- Chỉ hoạt động khi có token trong Redux store
- Tự động dừng khi component unmount hoặc token thay đổi
- Sử dụng `window.location.href` để đảm bảo chuyển hướng hoạt động đúng
