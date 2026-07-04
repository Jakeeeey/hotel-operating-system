"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/hotel-landing-page/user/reservations")
      .then((res) => res.json())
      .then((data) => {
        if (data.reservations) {
          setReservations(data.reservations);
        } else {
          setError(data.error || "Failed to load reservations");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Error loading reservations");
        setLoading(false);
      });
  }, []);

  // Compute all booked dates to pass to the calendar component
  const bookedDates: Date[] = [];
  reservations.forEach((res) => {
    const start = new Date(res.check_in);
    const end = new Date(res.check_out);
    
    // Add all dates between start and end (inclusive of start, exclusive of end typically, 
    // but for UI let's highlight all nights)
    let current = new Date(start);
    while (current < end) {
      bookedDates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "checked_in":
        return "default"; // or whatever standard color you want
      case "pending":
        return "secondary";
      case "checked_out":
      case "completed":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  if (loading) return <div className="p-8 text-neutral-500">Loading reservations...</div>;

  return (
    <div className="flex flex-col gap-8">
      
      {/* Calendar View Section */}
      <section className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-neutral-900">Your Booking Calendar</h2>
          <p className="text-sm text-neutral-500 mt-1">Easily view your upcoming and past stay dates.</p>
        </div>

        <div className="flex justify-center md:justify-start">
          <Calendar
            mode="multiple"
            selected={bookedDates}
            className="rounded-xl border border-neutral-200 pointer-events-none"
          />
        </div>
      </section>

      {/* Reservations Table Section */}
      <section className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-neutral-900">Reservation History</h2>
          <p className="text-sm text-neutral-500 mt-1">A detailed list of all your hotel bookings.</p>
        </div>

        {error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        ) : reservations.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 bg-neutral-50 rounded-xl border border-neutral-100 border-dashed">
            You have no reservations yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((res) => (
                  <TableRow key={res.id}>
                    <TableCell className="font-medium">
                      {new Date(res.check_in).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(res.check_out).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-neutral-600">
                      {res.adults_count} Adults, {res.children_count} Children
                    </TableCell>
                    <TableCell>
                      ${parseFloat(res.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(res.status) as any}>
                        {res.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

    </div>
  );
}
