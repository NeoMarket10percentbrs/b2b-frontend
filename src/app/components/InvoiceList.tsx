import { useState, useEffect } from "react";
import { FileText, Plus, Calendar, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { InvoiceDialog } from "./InvoiceDialog";
import { invoicesAPI, skusAPI, InvoiceResponse } from "../../api";

interface InvoiceWithDetails extends InvoiceResponse {
  totalItems: number;
  totalAmount: number;
}

const statusConfig = {
  CREATED: { label: "Создана", variant: "secondary" as const },
  ACCEPTED: { label: "Принята", variant: "default" as const },
};

export function InvoiceList() {
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoicesAPI.getInvoices(100, 0);
      const invoicesData = response.items;

      // Calculate totals for each invoice
      const invoicesWithDetails: InvoiceWithDetails[] = await Promise.all(
        invoicesData.map(async (invoice) => {
          let totalItems = 0;
          let totalAmount = 0;

          for (const item of invoice.items) {
            try {
              const sku = await skusAPI.getSku(item.sku_id);
              totalItems += item.quantity;
              totalAmount += sku.price * item.quantity;
            } catch (error) {
              console.error(`Failed to load SKU ${item.sku_id}:`, error);
            }
          }

          return {
            ...invoice,
            totalItems,
            totalAmount,
          };
        })
      );

      setInvoices(invoicesWithDetails);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvoice = async (invoiceId: string) => {
    try {
      await invoicesAPI.acceptInvoice(invoiceId);
      // Reload invoices to update status
      loadInvoices();
    } catch (error) {
      console.error('Failed to accept invoice:', error);
      alert('Не удалось принять накладную');
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (confirm('Вы уверены, что хотите удалить эту накладную?')) {
      try {
        await invoicesAPI.deleteInvoice(invoiceId);
        setInvoices(invoices.filter(inv => inv.id !== invoiceId));
      } catch (error) {
        console.error('Failed to delete invoice:', error);
        alert('Не удалось удалить накладную');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6" />
          <h2>Накладные</h2>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Создать накладную
        </Button>
      </div>

      <div className="border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Дата создания</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Позиций</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead className="w-[150px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Нет накладных
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => {
                const statusInfo = statusConfig[invoice.status];
                return (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(invoice.created_at).toLocaleDateString("ru-RU")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{invoice.totalItems}</TableCell>
                    <TableCell>
                      {(invoice.totalAmount / 100).toLocaleString("ru-RU")} ₽
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {invoice.status === "CREATED" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAcceptInvoice(invoice.id)}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Принять
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              Удалить
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <InvoiceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onInvoiceCreated={loadInvoices}
      />
    </div>
  );
}
