import {
  isTokenExpired,
  getTokenTimeRemaining,
  getTokenInfo,
} from "../util/auth/tokenManager";

// Test token utilities
const testTokenUtilities = () => {
  console.log("🧪 Testing Token Management Utilities...\n");

  // Test với token hợp lệ (mô phỏng)
  const validTokenData = {
    sub: "user123",
    role: "User",
    iat: Math.floor(Date.now() / 1000), // Thời điểm hiện tại
    exp: Math.floor(Date.now() / 1000) + 3600, // Hết hạn sau 1 giờ
  };

  // Tạo token giả (chỉ để test, không phải JWT thật)
  const mockValidToken = btoa(
    JSON.stringify({
      header: { alg: "HS256", typ: "JWT" },
      payload: validTokenData,
      signature: "mock_signature",
    })
  );

  // Test với token hết hạn
  const expiredTokenData = {
    sub: "user123",
    role: "User",
    iat: Math.floor(Date.now() / 1000) - 7200, // 2 giờ trước
    exp: Math.floor(Date.now() / 1000) - 3600, // Hết hạn 1 giờ trước
  };

  const mockExpiredToken = btoa(
    JSON.stringify({
      header: { alg: "HS256", typ: "JWT" },
      payload: expiredTokenData,
      signature: "mock_signature",
    })
  );

  // Test cases
  console.log("1. Test với token null:");
  console.log("   isTokenExpired(null):", isTokenExpired(null));
  console.log("   getTokenTimeRemaining(null):", getTokenTimeRemaining(null));
  console.log("   getTokenInfo(null):", getTokenInfo(null));

  console.log("\n2. Test với token không hợp lệ:");
  const invalidToken = "invalid.token.here";
  console.log("   isTokenExpired(invalidToken):", isTokenExpired(invalidToken));
  console.log(
    "   getTokenTimeRemaining(invalidToken):",
    getTokenTimeRemaining(invalidToken)
  );
  console.log("   getTokenInfo(invalidToken):", getTokenInfo(invalidToken));

  console.log("\n3. Test với token hợp lệ (mock):");
  console.log("   isTokenExpired(validToken):", isTokenExpired(mockValidToken));
  console.log(
    "   getTokenTimeRemaining(validToken):",
    getTokenTimeRemaining(mockValidToken),
    "ms"
  );
  console.log("   getTokenInfo(validToken):", getTokenInfo(mockValidToken));

  console.log("\n4. Test với token hết hạn (mock):");
  console.log(
    "   isTokenExpired(expiredToken):",
    isTokenExpired(mockExpiredToken)
  );
  console.log(
    "   getTokenTimeRemaining(expiredToken):",
    getTokenTimeRemaining(mockExpiredToken),
    "ms"
  );
  console.log("   getTokenInfo(expiredToken):", getTokenInfo(mockExpiredToken));

  console.log("\n✅ Test hoàn thành!");
};

// Component để chạy test
const TokenUtilityTest = () => {
  const runTest = () => {
    testTokenUtilities();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto mt-8">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Token Utility Test
      </h3>
      <p className="text-gray-600 mb-4">
        Nhấn nút bên dưới để chạy test các function utility trong console.
      </p>
      <button
        onClick={runTest}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
      >
        Chạy Test
      </button>
      <p className="text-sm text-gray-500 mt-2">
        Kiểm tra console (F12) để xem kết quả test.
      </p>
    </div>
  );
};

export default TokenUtilityTest;
