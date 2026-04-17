# API & Hooks Documentation

This document explains the API architecture used in our project and provides detailed guidelines on how and when to use our custom React Hooks (`useFetch`, `useApi`) and core HTTP engines (`client.ts`, `server.ts`).

---

## 1. React Hooks: `useFetch` vs `useApi`
These hooks are strictly for the frontend and should **only** be used inside **Client Components** (files with `"use client"`).

### 🟢 `useFetch` (Automatic Data Fetching)
**When to use:**
Use this hook when you need to fetch data from the database and display it on the screen (typically `GET` requests). It automatically fetches data as soon as the component mounts.

**Key Features:**
* Executes automatically on mount or when dependencies change.
* Provides an `isLoading` state to easily show loaders/spinners.
* Supports **polling** (automatically refetching data at specified intervals).
* Serves as an alternative to `useQuery` from React Query or `SWR`.

**How to use:**
```tsx
"use client";
import { useFetch } from "@/hooks/api/useFetch";
import { getProducts } from "@/services/product/product.service";

export default function ProductList() {
    // Automatically fetches data when the component loads
    const { data, isLoading, refetch } = useFetch(getProducts);

    if (isLoading) return <p>Loading...</p>;

    return (
        <div>
            <button onClick={refetch}>Refresh Data</button>
            {data?.map(product => <div key={product.id}>{product.name}</div>)}
        </div>
    );
}
```

### 🔴 `useApi` (Manual Actions / Mutations)
**When to use:**
Use this hook when you need to send, save, update, or delete data based on a user action, like clicking a button or submitting a form (typically `POST` / `PUT` / `DELETE` requests).

**Key Features:**
* Does **not** execute automatically.
* Only fires when you manually call the `execute()` function.
* Serves as an alternative to `useMutation` from React Query.

**How to use:**
```tsx
"use client";
import { useApi } from "@/hooks/api/useApi";
import { createProduct } from "@/services/product/product.service";

export default function AddProductForm() {
    const { execute, isLoading } = useApi(createProduct);

    const handleSubmit = async () => {
        // This function code only runs when the button is clicked
        const success = await execute({ name: "New Product" });
        if (success) {
            alert("Product successfully created!");
        }
    };

    return (
        <button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Product"}
        </button>
    );
}
```

---

## 2. Core API Engines: `client.ts` vs `server.ts`
These are **not** React Hooks. They are the core engines responsible for directly communicating with the backend server.

### 🌐 `client.ts` (Client-side HTTP Engine)
* **Where is it used?** Whenever an API request originates from the browser.
* **Description:** All of our custom hooks (`useFetch`, `useApi`) and Client Components use `client.ts` under the hood to fetch data. It automatically attaches the browser's authorization tokens to outgoing requests.

### 🖥️ `server.ts` (Server-side HTTP Engine)
* **Where is it used?** Inside Next.js **Server Components** and **Server Actions**.
* **Why is it important?** To ensure excellent SEO (Search Engine Optimization) and fast initial page loads, we use Next.js Server-Side Rendering (SSR). During SSR, data is fetched directly on the server using `server.ts`. **React Hooks cannot be used here.**

**Example (Using `server.ts` in a Server Component):**
```tsx
// app/blog/page.tsx (No "use client" directive)
import { getPosts } from "@/services/blog/blog.service"; // This service uses server.ts internally

export default async function BlogPage() {
    // Data is fetched directly on the server and sent to the browser as ready HTML (Best for SEO)
    const posts = await getPosts(); 

    return (
        <div>
            {posts.map(post => <h2 key={post.id}>{post.title}</h2>)}
        </div>
    );
}
```

---

## 🎯 Summary: What goes where?
1. **Server Components (For SEO/Fast Load):** Do **not** use hooks. Fetch data directly inside the Server Component using services backed by `server.ts`.
2. **Client Components (Automatic Display):** Use **`useFetch`** to automatically read data and display it.
3. **Client Components (User Actions/Forms):** Use **`useApi`** to manually send, update, or delete data upon user triggers (e.g., button clicks).
