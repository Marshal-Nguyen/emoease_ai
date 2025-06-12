
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProfileDoctor = () => {
  const id = localStorage.getItem('profileId'); // Lấy id từ localStorage
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [specialtiesList, setSpecialtiesList] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(null); // State cho URL ảnh đại diện
  const [avatarLoading, setAvatarLoading] = useState(false); // State cho trạng thái tải ảnh
  const fileInputRef = useRef(null); // Ref để kích hoạt input file
  const [formData, setFormData] = useState({
    FullName: "",
    Gender: "",
    contactInfo: {
      Address: "",
      PhoneNumber: "",
      Email: "",
    },
    specialties: [],
    Qualifications: "",
    YearsOfExperience: 0,
    Bio: "",
    Status: "",
  });

  // Định nghĩa URL API cố định cho localhost
  const VITE_API_PROFILE_URL = "http://localhost:3000/api";

  // Fetch dữ liệu bác sĩ
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${VITE_API_PROFILE_URL}/doctor-profiles/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const doctorProfile = response.data;

        setFormData({
          FullName: doctorProfile.FullName || "",
          Gender: doctorProfile.Gender || "",
          contactInfo: {
            Address: doctorProfile.Address || "",
            PhoneNumber: doctorProfile.PhoneNumber || "",
            Email: doctorProfile.Email || "",
          },
          specialties: doctorProfile.specialties.map(s => s.Id) || [],
          Qualifications: doctorProfile.Qualifications || "",
          YearsOfExperience: doctorProfile.YearsOfExperience || 0,
          Bio: doctorProfile.Bio || "",
          Status: doctorProfile.Status || "",
        });
        setAvatarUrl(doctorProfile.AvatarUrl || null); // Giả sử API trả về AvatarUrl
        setLoading(false);
      } catch (err) {
        setError("Lỗi khi lấy dữ liệu bác sĩ. Vui lòng thử lại.");
        setLoading(false);
        console.error("Lỗi khi lấy dữ liệu bác sĩ:", err);
      }
    };

    const fetchSpecialties = async () => {
      try {
        const response = await axios.get(`${VITE_API_PROFILE_URL}/specialties`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSpecialtiesList(response.data);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách chuyên môn:", err);
        setSpecialtiesList([
          { Id: "4064c495-80af-4f54-8bd2-151cebf029a6", Name: "Liệu pháp nghiện" },
          { Id: "cac4f120-834f-41f8-859d-dd1de7883609", Name: "Tâm lý trẻ em" },
          { Id: "8704cf2c-e7ec-4ece-a057-883653578ae6", Name: "Liệu pháp hành vi" },
          { Id: "ddf4b47a-65d1-451f-a297-41606caacfe2", Name: "Thần kinh học" },
          { Id: "e09aa07d-6313-4e21-919c-f17f3497b6ff", Name: "Chuyên môn mới 3" },
        ]);
      }
    };

    fetchDoctorData();
    fetchSpecialties();
  }, [id]);

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Xử lý thay đổi thông tin liên hệ
  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      contactInfo: { ...formData.contactInfo, [name]: value },
    });
  };

  // Xử lý chọn chuyên môn
  const handleSpecialtyChange = (e) => {
    const specialtyId = e.target.value;
    const isChecked = e.target.checked;

    setFormData(prev => {
      if (isChecked && !prev.specialties.includes(specialtyId)) {
        return { ...prev, specialties: [...prev.specialties, specialtyId] };
      } else if (!isChecked) {
        return { ...prev, specialties: prev.specialties.filter(id => id !== specialtyId) };
      }
      return prev;
    });
  };

  // Xử lý tải lên ảnh đại diện
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Kiểm tra kích thước file (max 5MB)
        toast.error("Kích thước file vượt quá 5MB!");
        return;
      }
      setAvatarLoading(true);
      try {
        // Tạo URL tạm thời để hiển thị ảnh trước khi tải lên
        const url = URL.createObjectURL(file);
        setAvatarUrl(url);

        // Giả lập tải lên ảnh (thay bằng API thật nếu có)
        const formData = new FormData();
        formData.append("avatar", file);
        // const response = await axios.post(`${VITE_API_PROFILE_URL}/upload-avatar`, formData, {
        //   headers: {
        //     Authorization: `Bearer ${localStorage.getItem("token")}`,
        //     "Content-Type": "multipart/form-data",
        //   },
        // });
        // setAvatarUrl(response.data.url); // Cập nhật URL từ API
        setAvatarLoading(false);
        toast.success("Ảnh đại diện đã được cập nhật!");
      } catch (err) {
        setAvatarLoading(false);
        toast.error("Lỗi khi tải lên ảnh đại diện!");
        console.error("Lỗi khi tải lên ảnh:", err);
      }
    }
  };

  // Kích hoạt input file
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const updatedProfile = {
        FullName: formData.FullName,
        Gender: formData.Gender,
        Address: formData.contactInfo.Address,
        PhoneNumber: formData.contactInfo.PhoneNumber,
        Email: formData.contactInfo.Email,
        Qualifications: formData.Qualifications,
        YearsOfExperience: parseInt(formData.YearsOfExperience),
        Bio: formData.Bio,
        Status: formData.Status,
      };

      const response = await axios.put(`${VITE_API_PROFILE_URL}/doctor-profiles/${id}`, updatedProfile, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Cập nhật specialties nếu có thay đổi
      if (formData.specialties.length > 0) {
        await axios.put(`${VITE_API_PROFILE_URL}/doctor-profiles/${id}`, {
          specialties: formData.specialties.map(id => ({ Id: id })),
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      }

      // Cập nhật formData với dữ liệu mới từ response
      const updatedData = await axios.get(`${VITE_API_PROFILE_URL}/doctor-profiles/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setFormData(prev => ({
        ...prev,
        ...updatedData.data,
        specialties: updatedData.data.specialties.map(s => s.Id),
      }));

      setLoading(false);
      toast.success("Hồ sơ bác sĩ đã được cập nhật thành công!");
    } catch (err) {
      toast.error("Lỗi khi cập nhật hồ sơ bác sĩ");
      setLoading(false);
      console.error("Lỗi cập nhật:", err.response ? err.response.data : err.message);
    }
  };

  if (loading)
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Đang tải...</p>
      </div>
    );
  if (error) return <div className="text-center p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-7xl h-[94vh] mx-auto p-6">
      <div className="h-full overflow-y-auto p-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200 border-4 border-purple-200 shadow-lg">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Ảnh đại diện"
                      className="w badge w-full object-cover object-center transform hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-20 w-20"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}
                  {avatarLoading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="absolute bottom-2 right-2 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 focus:outline-none transform hover:scale-110 transition-transform duration-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/jpeg, image/png, image/gif"
                className="hidden"
              />
              <p className="mt-4 text-sm text-gray-500 font-medium">
                Nhấn để {avatarUrl ? "thay đổi" : "tải lên"} ảnh đại diện
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Định dạng hỗ trợ: JPEG, PNG, GIF (tối đa 5MB)
              </p>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="FullName"
                  value={formData.FullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giới tính
                </label>
                <select
                  name="Gender"
                  value={formData.Gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required>
                  <option value="">Chọn giới tính</option>
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Non-binary">Không xác định</option>
                  <option value="Prefer not to say">Không muốn tiết lộ</option>
                </select>
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin chuyên môn</h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trình độ chuyên môn
                </label>
                <input
                  type="text"
                  name="Qualifications"
                  value={formData.Qualifications}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="VD: MD, Tiến sĩ Tâm lý học, Thạc sĩ Khoa học Thần kinh Nhận thức"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số năm kinh nghiệm
                </label>
                <input
                  type="number"
                  name="YearsOfExperience"
                  value={formData.YearsOfExperience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                  max="70"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiểu sử
                </label>
                <textarea
                  name="Bio"
                  value={formData.Bio}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="4"
                  placeholder="Cung cấp mô tả ngắn về kinh nghiệm, phương pháp trị liệu và lĩnh vực chuyên môn"
                  required></textarea>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Chuyên môn</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {specialtiesList.map((specialty) => (
                <div key={specialty.Id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`specialty-${specialty.Id}`}
                    value={specialty.Id}
                    checked={formData.specialties.includes(specialty.Id)}
                    onChange={handleSpecialtyChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`specialty-${specialty.Id}`}
                    className="ml-2 text-sm text-gray-700">
                    {specialty.Name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin liên hệ</h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="Email"
                  value={formData.contactInfo.Email}
                  onChange={handleContactInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="PhoneNumber"
                  value={formData.contactInfo.PhoneNumber}
                  onChange={handleContactInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <textarea
                  name="Address"
                  value={formData.contactInfo.Address}
                  onChange={handleContactInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                  required></textarea>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/doctors/${id}`)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700">
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileDoctor;