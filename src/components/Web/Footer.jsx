import styles from "../../styles/Web/Footer.module.css";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="grid grid-cols-1">
      {/* Hàng 1 - Logo EMOEASE */}
      <div className="relative h-40 bg-white">
        <span
          className={`${styles.Holtwood}
            absolute
            text-[#4a2580]
            top-10
            left-1/2
            transform
            -translate-x-1/2
            font-bold
            text-[9rem]
            leading-none
            `}>
          EMOEASE
        </span>
      </div>

      {/* Hàng 2 - Footer chính */}
      <div className="w-full bg-[#4a2580] py-8">
        {/* Container chính */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Phần trên - Logo, Links, Contact */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6">
            {/* Logo section */}
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="text-2xl font-bold tracking-wider text-white">
                SOLTECH
              </span>
            </div>

            {/* Links section */}
            <div className="flex gap-8">
              <a
                href="#"
                className="text-white hover:text-gray-200 transition-colors">
                Terms & Conditions
              </a>
              <a
                href="#"
                className="text-white hover:text-gray-200 transition-colors">
                Privacy Policy
              </a>
            </div>

            {/* Contact section */}
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white mr-2"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <a
                href="mailto:Gianggg244@gmail.com"
                className="text-white hover:text-gray-200 transition-colors">
                Gianggg244@gmail.com
              </a>
              <Link
                to="addProduct"
                className="cursor-pointer duration-200 hover:scale-125 active:scale-100"
                title="Attach">
                <svg
                  className="stroke-blue-300 fill-none"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20px"
                  height="20px"
                  viewBox="0 -0.5 25 25">
                  <path
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="1.5"
                    d="M15.17 11.053L11.18 15.315C10.8416 15.6932 10.3599 15.9119 9.85236 15.9178C9.34487 15.9237 8.85821 15.7162 8.51104 15.346C7.74412 14.5454 7.757 13.2788 8.54004 12.494L13.899 6.763C14.4902 6.10491 15.3315 5.72677 16.2161 5.72163C17.1006 5.71649 17.9463 6.08482 18.545 6.736C19.8222 8.14736 19.8131 10.2995 18.524 11.7L12.842 17.771C12.0334 18.5827 10.9265 19.0261 9.78113 18.9971C8.63575 18.9682 7.55268 18.4695 6.78604 17.618C5.0337 15.6414 5.07705 12.6549 6.88604 10.73L12.253 5"></path>
                </svg>
              </Link>
            </div>
          </div>

          {/* Đường kẻ ngang */}
          <hr className="border-t border-purple-400/30 my-4" />

          {/* Phần dưới - Social icons và Copyright */}
          <div className="pt-4 flex flex-col items-center">
            {/* Copyright */}
            <p className="text-white text-center">
              © {new Date().getFullYear()} SOLTECH. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
