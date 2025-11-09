import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setFilters, fetchEmployees, setPagination } from '../../store/slices/employeeSlice';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export const EmployeeFilters = () => {
  const dispatch = useAppDispatch();
  const { filters, pagination } = useAppSelector((state) => state.employees);

  const [localFilters, setLocalFilters] = useState({
    email: filters.email || '',
    name: filters.name || '',
    phoneNumber: filters.phoneNumber || '',
    department: filters.department || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanFilters = Object.fromEntries(
      Object.entries(localFilters).filter(([_, v]) => v.trim() !== '')
    );
    dispatch(setFilters(cleanFilters));
    dispatch(setPagination({ ...pagination, page: 1 }));
    dispatch(fetchEmployees({ filters: cleanFilters, pagination: { ...pagination, page: 1 } }));
  };

  const handleReset = () => {
    setLocalFilters({
      email: '',
      name: '',
      phoneNumber: '',
      department: '',
    });
    dispatch(setFilters({}));
    dispatch(setPagination({ ...pagination, page: 1 }));
    dispatch(fetchEmployees({ filters: {}, pagination: { ...pagination, page: 1 } }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-5 rounded-lg border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          label="Email"
          type="text"
          name="email"
          value={localFilters.email}
          onChange={handleChange}
          placeholder="Filter by email"
        />
        <Input
          label="Name"
          type="text"
          name="name"
          value={localFilters.name}
          onChange={handleChange}
          placeholder="Filter by name"
        />
        <Input
          label="Phone Number"
          type="text"
          name="phoneNumber"
          value={localFilters.phoneNumber}
          onChange={handleChange}
          placeholder="Filter by phone"
        />
        <Input
          label="Department"
          type="text"
          name="department"
          value={localFilters.department}
          onChange={handleChange}
          placeholder="Filter by department"
        />
      </div>
      <div className="flex gap-2 mt-5">
        <Button type="submit" variant="primary" size="sm">
          Apply Filters
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </form>
  );
};

