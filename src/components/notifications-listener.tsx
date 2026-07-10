import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  registerChatNotificationSW,
  ensureChatNotificationPermission,
  primeChatAudio,
  notifyIncomingMessage,
} from "@/lib/chat-notify";
import { ensurePushSubscription } from "@/lib/push-client";

// Global listener: whenever a new row is inserted into `notifications`
// for the signed-in user, play the notification sound and pop a system
// notification (which appears in the phone's notification tray/drawer
// when the PWA is installed or the browser is running in the background).
export function NotificationsListener() {
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    void (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!uid || cancelled) return;

      void registerChatNotificationSW();
      primeChatAudio();
      const perm = await ensureChatNotificationPermission();
      if (perm === "granted") {
        void ensurePushSubscription();
      }

      channel = supabase
        .channel(`notifications:${uid}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${uid}`,
          },
          (payload) => {
            const n = payload.new as { title?: string; body?: string | null };
            notifyIncomingMessage(
              n.title || "إشعار جديد",
              n.body || undefined,
              "/portal/notifications",
            );
          },
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return null;
}