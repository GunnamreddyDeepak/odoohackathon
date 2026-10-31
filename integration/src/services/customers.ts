
import api from "./api";
import type { Customer, CustomerUpdate } from "../types/customer";

export const getCustomer = (id: string | number) =>
  api.get<Customer>(`/customers/${id}`).then((r) => r.data);

export const updateCustomer = (id: string | number, data: CustomerUpdate) =>
  api.patch<Customer>(`/customers/${id}`, data).then((r) => r.data);