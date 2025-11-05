import React, { useEffect, useReducer, useMemo, useCallback, useState, useRef, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext.jsx";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchIssueOrderById,
  addIssueOrder,
  updateIssueOrder,
  clearCurrentIssueOrder,
} from "../Slices/IssueOrderSlice.jsx";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import FullPageSpinner from "./FullPageSpinner.jsx";
import { toast } from "react-toastify";

// --- ICONS (self-contained) ---
const PlusIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" /></svg>
);
const TrashIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 1 0 .53 1.405c.75-.238 1.501-.386 2.25-.443v.25h-.75a.75.75 0 0 0 0 1.5h.75v.25h-.75a.75.75 0 0 0 0 1.5h.75v.25h-.75a.75.75 0 0 0 0 1.5h.75v.25h-.75a.75.75 0 0 0 0 1.5h.75v.25h-.75a.75.75 0 0 0 0 1.5h.75v.25a.75.75 0 0 0 1.5 0v-.25h.75a.75.75 0 0 0 0-1.5h-.75v-.25h.75a.75.75 0 0 0 0-1.5h-.75v-.25h.75a.75.75 0 0 0 0-1.5h-.75v-.25h.75a.75.75 0 0 0 0-1.5h-.75v-.25h.75a.75.75 0 0 0 0-1.5h-.75v-.25c.75.057 1.502.205 2.25.443a.75.75 0 1 0 .53-1.405c-.785-.248-1.57-.39-2.365-.468V3.75A2.75 2.75 0 0 0 8.75 1ZM10 12.5a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0v-2.5Z" clipRule="evenodd" /></svg>
);
const SpinnerIcon = ({ className = '' }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
);
const ChevronDownIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
);

import { API_BASE_URL } from '../../config.js';

const fetchCustomers = async (inputValue) => {
  const data = await fetchWithAuth(`${API_BASE_URL}/api/customers?search=${inputValue || ''}`);
  return data.customers.map((cust) => ({ label: cust.name, value: cust._id }));
};

const fetchProducts = async (inputValue) => {
  const data = await fetchWithAuth(`${API_BASE_URL}/api/products?search=${inputValue || ''}`);
  return data.products.map((prod) => ({ label: prod.name, value: prod._id, sellingPrice: prod.sellingPrice || '' }));
};

// --- HELPER HOOKS ---
function useDebounce(value, delay) { const [debouncedValue, setDebouncedValue] = useState(value); useEffect(() => { const handler = setTimeout(() => setDebouncedValue(value), delay); return () => clearTimeout(handler); }, [value, delay]); return debouncedValue; }
const useClickOutside = (ref, handler) => { useEffect(() => { const listener = (event) => { if (!ref.current || ref.current.contains(event.target)) return; handler(); }; document.addEventListener('mousedown', listener); document.addEventListener('touchstart', listener); return () => { document.removeEventListener('mousedown', listener); document.removeEventListener('touchstart', listener); }; }, [ref, handler]); };

// --- STYLED & REUSABLE COMPONENTS ---
const Card = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}>
        <div className="p-6">{children}</div>
    </div>
);

const Input = ({ label, id, ...props }) => (
    <div className="relative">
        <input
            id={id}
            className="block px-3 py-2.5 w-full text-sm text-slate-900 bg-transparent rounded-md border border-slate-300 appearance-none dark:text-white dark:border-slate-600 dark:focus:border-primary-500 focus:outline-none focus:ring-0 focus:border-primary-600 peer"
            placeholder=" "
            {...props}
        />
        <label
            htmlFor={id}
            className="absolute text-sm text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-slate-900 px-2 peer-focus:px-2 peer-focus:text-primary-600 peer-focus:dark:text-primary-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
        >
            {label}
        </label>
    </div>
);

const AsyncSelect = ({ value, onChange, loadOptions, placeholder, label, id }) => {
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const debouncedInputValue = useDebounce(inputValue, 300);
    const containerRef = useRef(null);
    useClickOutside(containerRef, () => setIsOpen(false));

    useEffect(() => {
        if (!isOpen) return;
        setIsLoading(true);
        loadOptions(debouncedInputValue).then(newOptions => {
            setOptions(newOptions);
            setIsLoading(false);
        }).catch(() => {
            setOptions([]);
            setIsLoading(false);
        });
    }, [debouncedInputValue, loadOptions, isOpen]);
    
    const selectOption = (option) => { onChange(option); setInputValue(option.label); setIsOpen(false); };

    return (
        <div className="relative" ref={containerRef}>
            <div className="relative" onClick={() => setIsOpen(!isOpen)}>
                 <Input 
                    id={id}
                    label={label} 
                    value={value ? value.label : inputValue}
                    onChange={e => {
                        setInputValue(e.target.value);
                        onChange(null);
                        if (!isOpen) setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    autoComplete="off"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {isLoading ? <SpinnerIcon className="w-4 h-4 text-slate-400" /> : <ChevronDownIcon className="w-5 h-5 text-slate-400 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />}
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 max-h-60 overflow-auto">
                    {options.length > 0 ? options.map(option => (
                        <div key={option.value} onClick={() => selectOption(option)} className="cursor-pointer p-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-600">
                            {option.label}
                        </div>
                    )) : !isLoading && <div className="p-3 text-sm text-slate-500">No results found.</div>}
                </div>
            )}
        </div>
    );
};

// --- REDUCER ---
const initialState = { clientName: '', clientPhone: '', customerId: null, products: [{ id: crypto.randomUUID(), productId: null, quantity: '1', unitPrice: '' }], issueDate: new Date().toISOString().split('T')[0], };
function formReducer(state, action) {
    switch (action.type) {
        case 'SET_FIELD': return { ...state, [action.field]: action.value };
        case 'SET_PRODUCT_FIELD': return { ...state, products: state.products.map((p, i) => i === action.index ? { ...p, [action.field]: action.value } : p) };
        case 'ADD_PRODUCT': return { ...state, products: [...state.products, { id: crypto.randomUUID(), productId: null, quantity: '1', unitPrice: '' }] };
        case 'REMOVE_PRODUCT': return { ...state, products: state.products.filter((_, i) => i !== action.index) };
        case 'SET_FORM_DATA': return { ...state, ...action.data };
        case 'RESET': return initialState;
        default: return state;
    }
}

// --- MAIN FORM COMPONENT ---
const IssueOrderForm = () => {
    const dispatch = useDispatch();
    const { currentIssueOrder: order, loading, error } = useSelector((state) => state.issueOrders);
    const { isAdmin, isManager, user } = useContext(AuthContext);
    const { darkMode } = useContext(DarkModeContext); // Though using dark: classes, keep for compatibility if needed
    const navigate = useNavigate();
    const { id: orderId } = useParams();
    const isEditMode = !!orderId;
    const [state, formDispatch] = useReducer(formReducer, initialState);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isAdmin && !isManager) {
            toast.error('You are not authorized to view this page.');
            navigate("/ims/issue-orders", { replace: true });
        }
    }, [isAdmin, isManager, navigate]);

    useEffect(() => {
        if (isEditMode && user?.userId) {
            dispatch(fetchIssueOrderById({ id: orderId, user })).unwrap().catch(err => {
            });
        }
        return () => { dispatch(clearCurrentIssueOrder()); };
    }, [orderId, dispatch, user, isEditMode]);

    useEffect(() => {
        if (isEditMode && order) {
            formDispatch({
                type: 'SET_FORM_DATA',
                data: {
                    clientName: order.clientName || "",
                    clientPhone: order.clientPhone || "",
                    customerId: order.customerId ? { value: order.customerId._id, label: order.customerId.name } : null,
                    products: order.products.map((p) => ({
                        id: crypto.randomUUID(),
                        productId: p.productId ? { value: p.productId._id, label: p.productId.name, price: p.productId.price || '' } : null,
                        quantity: p.quantity?.toString() || "1",
                        unitPrice: p.unitPrice?.toString() || "",
                    })),
                    issueDate: order.issueDate ? new Date(order.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                }
            });
        }
    }, [order, isEditMode]);

    const totalAmount = useMemo(() => state.products.reduce((sum, p) => sum + (parseFloat(p.quantity) || 0) * (parseFloat(p.unitPrice) || 0), 0), [state.products]);

    const handleProductChange = useCallback((index, field, value) => {
        formDispatch({ type: 'SET_PRODUCT_FIELD', index, field, value });
        if (field === 'productId' && value?.sellingPrice) {
            formDispatch({ type: 'SET_PRODUCT_FIELD', index, field: 'unitPrice', value: value.sellingPrice });
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!state.clientName.trim()) return toast.error("Client name is required");
        if (!state.issueDate) return toast.error("Issue date is required");
        if (state.products.some(p => !p.productId || !p.quantity || +p.quantity <= 0 || !p.unitPrice || +p.unitPrice < 0)) {
            return toast.error("Please fill all product fields correctly.");
        }
        
        setIsSaving(true);
        try {
            const issueOrderData = {
                clientName: state.clientName,
                clientPhone: state.clientPhone || undefined,
                customerId: state.customerId?.value || undefined,
                products: state.products.map((p) => ({
                    productId: p.productId.value,
                    quantity: parseInt(p.quantity, 10),
                    unitPrice: parseFloat(p.unitPrice),
                })),
                totalAmount: totalAmount,
                issueDate: state.issueDate,
            };

            if (isEditMode) {
                await dispatch(updateIssueOrder({ id: orderId, issueOrderData, user })).unwrap();
            } else {
                await dispatch(addIssueOrder({ issueOrderData, user })).unwrap();
            }
            navigate("/ims/issue-orders");
        } catch (err) {
            
        } finally {
            setIsSaving(false);
        }
    };

    if (loading && isEditMode) return <FullPageSpinner />;
    if (error && isEditMode && !order) return <div className={`text-center mt-4 p-4 ${darkMode ? "text-red-400" : "text-red-600"}`}>{error}</div>;

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSubmit} className="space-y-8">
                <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{isEditMode ? 'Edit Issue Order' : 'Create Issue Order'}</h1>
                    <div className="flex items-center space-x-3 flex-shrink-0">
                        <Link to="/ims/issue-orders" className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">Cancel</Link>
                        <button type="submit" disabled={isSaving || loading} className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:bg-primary-400 dark:disabled:bg-primary-800 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            {isSaving && <SpinnerIcon className="w-4 h-4" />}
                            <span>{isSaving ? 'Saving...' : isEditMode ? 'Update Order' : 'Create Order'}</span>
                        </button>
                    </div>
                </header>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-6">Client Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input id="clientName" label="Client Name *" value={state.clientName} onChange={e => formDispatch({type: 'SET_FIELD', field: 'clientName', value: e.target.value})} required />
                                <Input id="clientPhone" label="Client Phone" type="tel" value={state.clientPhone} onChange={e => formDispatch({type: 'SET_FIELD', field: 'clientPhone', value: e.target.value})} />
                                <div className="md:col-span-2">
                                <AsyncSelect id="customer-select" value={state.customerId} onChange={option => formDispatch({type: 'SET_FIELD', field: 'customerId', value: option})} loadOptions={fetchCustomers} placeholder="Search existing customers..." label="Existing Customer (Optional)" />
                                </div>
                            </div>
                        </Card>
                        <Card>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-medium text-slate-900 dark:text-white">Products</h2>
                                <button type="button" onClick={() => formDispatch({type: 'ADD_PRODUCT'})} className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                    <PlusIcon className="w-4 h-4" />
                                    <span>Add</span>
                                </button>
                            </div>
                            <div className="space-y-4">
                                {state.products.map((product, index) => (
                                    <div key={product.id} className="grid grid-cols-12 gap-4 items-center p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                                    <div className="col-span-12 md:col-span-5">
                                        <AsyncSelect id={`product-${product.id}`} value={product.productId} onChange={option => handleProductChange(index, 'productId', option)} loadOptions={fetchProducts} placeholder="Search products..." label="Product *" />
                                    </div>
                                    <div className="col-span-6 md:col-span-2">
                                        <Input id={`quantity-${index}`} label="Qty *" type="number" min="1" value={product.quantity} onChange={e => handleProductChange(index, 'quantity', e.target.value)} />
                                    </div>
                                    <div className="col-span-6 md:col-span-3">
                                        <Input id={`price-${index}`} label="Unit Price *" type="number" min="0" step="0.01" value={product.unitPrice} onChange={e => handleProductChange(index, 'unitPrice', e.target.value)} />
                                    </div>
                                    <div className="col-span-12 md:col-span-2 flex justify-end items-center">
                                        {state.products.length > 1 && (
                                            <button type="button" onClick={() => formDispatch({type: 'REMOVE_PRODUCT', index})} aria-label="Remove Product" className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        <Card className="sticky top-8">
                            <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-6">Order Summary</h2>
                            <div className="space-y-6">
                                <Input id="issueDate" label="Issue Date *" type="date" value={state.issueDate} onChange={e => formDispatch({type: 'SET_FIELD', field: 'issueDate', value: e.target.value})} required />
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Amount</p>
                                    <p className="text-4xl font-bold text-primary-600 dark:text-primary-400">${totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default IssueOrderForm;