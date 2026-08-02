export type BookingStatus = "pending" | "confirmed";

export type BookingRequest = {
  experienceId: string;
  guests: number;
  time: string;
  notes?: string;
};

export async function requestVicBooking(
  input: BookingRequest
): Promise<{ status: BookingStatus; bookingId: string }> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 700);
  });

  return {
    status: "pending",
    bookingId: `demo-${input.experienceId}`,
  };
}
