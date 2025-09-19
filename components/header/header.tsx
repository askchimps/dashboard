"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/actions/signout";
import { redirect } from "next/navigation";
import { LogOutIcon } from "lucide-react";

export default function Header() {
    async function handleSignOut() {
        await signOutAction();
        redirect("/signin");
    }
    return (
        <header className="flex w-full shrink-0 items-center justify-between border-b bg-primary-foreground px-5 py-4">
            <div>
                <Image
                    src="/logo/icon-logo.svg"
                    alt="Logo"
                    width={50}
                    height={50}
                />
            </div>
            <div>
                <Button type="submit" variant={"outline"} className="cursor-pointer" onClick={() => void handleSignOut()}>
                    <LogOutIcon />
                </Button>
            </div>
        </header>
    )
}