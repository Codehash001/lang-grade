import Link from "next/link";

export default function LogoComponent() {
    return (
        <Link href={"/"} className="bg-white text-white rounded-full border border-gray-200 shadow-xl w-12 h-12 flex items-center justify-center">
        <span className="text-xs font-bold">
          <img src="/images/logo.png" alt="Logo" className="w-10 h-auto"/>
        </span>
      </Link>
    );
}