
import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Order } from "@/types/order.types";

interface SalesTabProps {
  orders: Order[];
}

const SalesTab: React.FC<SalesTabProps> = ({ orders }) => {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">All Sales</h2>
      
      {orders.length === 0 ? (
        <p className="text-muted-foreground">No sales found.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono">{order.id}</TableCell>
                  <TableCell>{order.buyerId}</TableCell>
                  <TableCell>{order.items.length} items</TableCell>
                  <TableCell>₹{order.totalAmount}</TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      order.status === 'completed' ? "bg-green-600" : 
                      order.status === 'processing' ? "bg-blue-600" : 
                      "bg-amber-600"
                    }>
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
};

export default SalesTab;
