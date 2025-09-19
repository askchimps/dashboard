import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="flex items-center justify-center gap-2 px-8 py-4">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logo/icon-logo.svg"
                        alt="Full Askchimps Logo"
                        width={40}
                        height={40}
                        priority
                    />
                    <Image
                        src="/logo/text-logo.svg"
                        alt="Full Askchimps Logo"
                        width={180}
                        height={36}
                        priority
                    />
                </Link>
            </header>
            <main className="flex h-full w-full flex-1 flex-col items-center justify-center gap-4 px-2 lg:px-8">{children}</main>
            <footer className="flex items-center justify-center gap-2 px-8 py-4"><p className="text-paragraph-3">© 2025 AskChimps, inc.</p></footer>
        </div>
    );
}