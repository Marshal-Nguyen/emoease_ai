import React, { useState } from "react";
import supabase from "../../../Supabase/supabaseClient"; // Đảm bảo đường dẫn đúng đến supabaseClient

const AddProductPage = () => {
  const [product, setProduct] = useState({
    category: "",
    description: "",
    usage: "",
    instructions: "",
    notes: "",
    price: "",
    link: "",
    image_path: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const YOUR_TOKEN = localStorage.getItem("token");
  // Xử lý upload hình ảnh
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(
          fileName,
          file,
          { cacheControl: "3600", upsert: false },
          {
            headers: {
              Authorization: `Bearer ${
                supabase.auth.getSession().data.session.access_token
              }`,
            },
          }
        );
      if (uploadError) {
        setError("Lỗi khi upload hình ảnh: " + uploadError.message);
        return;
      }
      setProduct((prev) => ({ ...prev, image_path: fileName }));
      console.log({
        headers: {
          Authorization: `Bearer ${
            supabase.auth.getSession().data.session.access_token
          }`,
        },
      });
    }
  };

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Chuyển price thành số
    const price = parseFloat(product.price);
    if (isNaN(price)) {
      setError("Giá phải là một số hợp lệ.");
      return;
    }

    const newProduct = {
      Category: product.category,
      Description: product.description,
      Usage: product.usage,
      Instructions: product.instructions,
      Notes: product.notes,
      Price: price,
      Link: product.link,
      image_path: product.image_path,
    };

    const { error } = await supabase.from("StoreAffiliate").insert(newProduct);
    if (error) {
      setError("Lỗi khi lưu sản phẩm: " + error.message);
    } else {
      setSuccess("Sản phẩm đã được lưu thành công!");
      setProduct({
        category: "",
        description: "",
        usage: "",
        instructions: "",
        notes: "",
        price: "",
        link: "",
        image_path: "",
      });
      setImageFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-purple-600 mb-8">
          Thêm Sản Phẩm Mới
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
          {/* Upload Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh sản phẩm
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
            {product.image_path && (
              <input
                type="text"
                value={product.image_path}
                readOnly
                className="w-full mt-2 border border-gray-300 rounded-lg p-2 bg-gray-100 cursor-not-allowed"
                placeholder="Đường dẫn hình ảnh sẽ tự động điền sau khi upload"
              />
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại sản phẩm
            </label>
            <input
              type="text"
              name="category"
              value={product.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Nhập loại sản phẩm"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={product.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Nhập mô tả sản phẩm"
              rows="3"
            />
          </div>

          {/* Usage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Công dụng
            </label>
            <input
              type="text"
              name="usage"
              value={product.usage}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Nhập công dụng"
            />
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hướng dẫn sử dụng
            </label>
            <textarea
              name="instructions"
              value={product.instructions}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Nhập hướng dẫn sử dụng"
              rows="3"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lưu ý
            </label>
            <textarea
              name="notes"
              value={product.notes}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Nhập lưu ý"
              rows="3"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá (VNĐ)
            </label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Nhập giá"
              required
            />
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link Affiliate
            </label>
            <input
              type="text"
              name="link"
              value={product.link}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Nhập link affiliate"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-all duration-300">
            Thêm Sản Phẩm
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;
