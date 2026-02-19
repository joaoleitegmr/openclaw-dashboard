'use client';

import { useEffect, useState, useCallback } from 'react';
import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { IconPlus, IconEdit, IconTrash, IconCoins } from '@tabler/icons-react';

interface Expense {
  id: string;
  name: string;
  category: string;
  amount: number;
  currency: string;
  frequency: string;
  date: string;
  notes: string;
}

const emptyExpense: Omit<Expense, 'id'> = {
  name: '',
  category: '',
  amount: 0,
  currency: 'USD',
  frequency: 'monthly',
  date: '',
  notes: ''
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [form, setForm] = useState(emptyExpense);

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await fetch('/api/openclaw/expenses');
      const data = await res.json();
      setExpenses(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const monthlyTotal = expenses
    .filter((e) => e.frequency === 'monthly')
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const handleSave = async () => {
    const method = editingExpense ? 'PUT' : 'POST';
    const body = editingExpense ? { ...form, id: editingExpense.id } : form;
    await fetch('/api/openclaw/expenses', {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
    setDialogOpen(false);
    setEditingExpense(null);
    setForm(emptyExpense);
    fetchExpenses();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    await fetch('/api/openclaw/expenses', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id })
    });
    fetchExpenses();
  };

  const openEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setForm({
      name: expense.name,
      category: expense.category,
      amount: expense.amount,
      currency: expense.currency,
      frequency: expense.frequency,
      date: expense.date,
      notes: expense.notes
    });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditingExpense(null);
    setForm(emptyExpense);
    setDialogOpen(true);
  };

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight'>Expenses</h2>
          <Button size='sm' onClick={openNew}>
            <IconPlus className='mr-1 size-4' />
            Add Expense
          </Button>
        </div>

        {/* Monthly Total */}
        <Card>
          <CardHeader className='pb-2'>
            <CardDescription className='flex items-center gap-2'>
              <IconCoins className='size-4' />
              Monthly Total
            </CardDescription>
            <CardTitle className='text-2xl'>
              ${monthlyTotal.toFixed(2)}
              <span className='text-muted-foreground ml-2 text-sm font-normal'>
                / month
              </span>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className='p-0'>
            {loading ? (
              <div className='flex items-center justify-center py-20'>
                <div className='border-muted-foreground size-6 animate-spin rounded-full border-2 border-t-transparent' />
              </div>
            ) : expenses.length === 0 ? (
              <p className='text-muted-foreground py-20 text-center text-sm'>
                No expenses tracked
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className='text-right'>Amount</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className='w-[80px]'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell className='text-sm font-medium'>
                        {exp.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>
                          {exp.category || 'other'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right text-sm font-medium'>
                        {exp.currency === 'EUR' ? '€' : '$'}
                        {exp.amount?.toFixed(2)}
                      </TableCell>
                      <TableCell className='text-sm'>{exp.frequency}</TableCell>
                      <TableCell className='text-muted-foreground text-xs'>
                        {exp.date || '-'}
                      </TableCell>
                      <TableCell className='text-muted-foreground max-w-[200px] truncate text-xs'>
                        {exp.notes || '-'}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1'>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='size-7'
                            onClick={() => openEdit(exp)}
                          >
                            <IconEdit className='size-3.5' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='size-7'
                            onClick={() => handleDelete(exp.id)}
                          >
                            <IconTrash className='size-3.5' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingExpense ? 'Edit Expense' : 'Add Expense'}
              </DialogTitle>
            </DialogHeader>
            <div className='space-y-3'>
              <Input
                placeholder='Name'
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder='Category'
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <div className='flex gap-2'>
                <Input
                  type='number'
                  placeholder='Amount'
                  value={form.amount || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      amount: parseFloat(e.target.value) || 0
                    })
                  }
                />
                <select
                  value={form.currency}
                  onChange={(e) =>
                    setForm({ ...form, currency: e.target.value })
                  }
                  className='bg-background border-input h-9 rounded-md border px-3 text-sm outline-none'
                >
                  <option value='USD'>USD</option>
                  <option value='EUR'>EUR</option>
                </select>
              </div>
              <select
                value={form.frequency}
                onChange={(e) =>
                  setForm({ ...form, frequency: e.target.value })
                }
                className='bg-background border-input h-9 w-full rounded-md border px-3 text-sm outline-none'
              >
                <option value='monthly'>Monthly</option>
                <option value='yearly'>Yearly</option>
                <option value='one-time'>One-time</option>
                <option value='weekly'>Weekly</option>
              </select>
              <Input
                placeholder='Notes'
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
              <Button onClick={handleSave} className='w-full'>
                {editingExpense ? 'Update' : 'Add'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
