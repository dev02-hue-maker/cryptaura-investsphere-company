"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"

export default function TawkToScript() {
  const pathname = usePathname()

  const isUserOrAdminPage =
    pathname.startsWith("/user") || pathname.startsWith("/savio")

  if (isUserOrAdminPage) return null

  return (
    <Script id="tawkto-script" strategy="afterInteractive">
      {`
        var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
        (function(){
          var s1=document.createElement("script"),
              s0=document.getElementsByTagName("script")[0];
          s1.async=true;
          s1.src='https://embed.tawk.to/692940e84a533b1961fc3a38/default';
          s1.charset='UTF-8';
          s1.setAttribute('crossorigin','*');
          s0.parentNode.insertBefore(s1,s0);
        })();
      `}
    </Script>
  )
}