import { request } from "@/services/xano";

export async function endorseCreator(userTurboId: number, vicId: number): Promise<void> {
  await request("/endorse", {
    method: "PUT",
    body: JSON.stringify({ user_turbo_id: userTurboId, vic_id: vicId }),
  });
}
