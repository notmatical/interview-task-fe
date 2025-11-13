"use client";

import Link from "next/link";
import { UserDropdown } from "../user/user-dropdown";

export default function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <div className="mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="font-semibold text-lg hidden sm:inline-block">
                            Aftermath FE Test
                        </span>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <UserDropdown />
                    </div>
                </div>
            </div>
        </header>
    );
}