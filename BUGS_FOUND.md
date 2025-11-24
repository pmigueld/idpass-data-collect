# Bugs Found During QA Testing

## Critical Bugs

### Bug 1: Next.js 15 Dynamic Route Params Not Awaited
**Location**: `packages/admin-new/admin/app/formapps/[id]/page.tsx`
**Line**: 14-17
**Severity**: Critical - Page fails to render
**Error Message**: 
```
Route "/formapps/[id]" used `params.id`. `params` should be awaited before using its properties.
```

**Description**: 
In Next.js 15, dynamic route parameters must be awaited before accessing their properties. The current code directly accesses `params.id` without awaiting `params` first.

**Current Code**:
```typescript
export default async function FormAppDetailPage({ params }: { params: { id: string } }) {
  let program
  try {
    program = await getCollectionProgram(params.id)
  } catch {
    notFound()
  }
  return <FormAppDetailClient program={program} programId={params.id} />
}
```

**Expected Fix**:
```typescript
export default async function FormAppDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let program
  try {
    program = await getCollectionProgram(id)
  } catch {
    notFound()
  }
  return <FormAppDetailClient program={program} programId={id} />
}
```

---

### Bug 2: Missing `name` Property on BackendUser
**Location**: `packages/admin-new/admin/components/user-management.tsx`
**Line**: 36
**Severity**: Critical - Causes runtime error and breaks Users page
**Error Message**: 
```
Uncaught TypeError: Cannot read properties of undefined (reading 'toLowerCase')
```

**Description**: 
The `BackendUser` interface only has `id`, `email`, and `role` properties, but the code tries to access `user.name.toLowerCase()` in the filter function. The backend API doesn't return a `name` field.

**Current Code**:
```typescript
const filteredUsers = users.filter(
  (user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()),
)
```

**Expected Fix**:
Remove the `user.name` check since the backend doesn't provide this field:
```typescript
const filteredUsers = users.filter(
  (user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()),
)
```

**Additional Issue**: The component also displays `user.email.split("@")[0]` as the user name (line 163), which is fine, but the search filter shouldn't reference a non-existent `name` property.

---

### Bug 3: Potential Null/Undefined formSchema Access
**Location**: `packages/admin-new/admin/components/formapp-detail-client.tsx`
**Line**: 115
**Severity**: High - Causes runtime error when viewing collection program details
**Error Message**: 
```
Uncaught TypeError: Cannot convert undefined or null to object
```

**Description**: 
The code calls `Object.keys(f.formSchema)` without checking if `f.formSchema` exists. If a form doesn't have a `formSchema` property or it's null/undefined, this will throw an error.

**Current Code**:
```typescript
forms={forms.map((f) => ({
  id: f.id,
  name: f.name,
  version: f.version,
  fields: Object.keys(f.formSchema).length,
  entityCount: 0,
}))}
```

**Expected Fix**:
Add a null check and provide a default value:
```typescript
forms={forms.map((f) => ({
  id: f.id,
  name: f.name,
  version: f.version,
  fields: f.formSchema ? Object.keys(f.formSchema).length : 0,
  entityCount: 0,
}))}
```

---

## Summary

- **Total Bugs Found**: 3
- **Critical**: 2 (Bugs 1 & 2 - prevent pages from rendering)
- **High**: 1 (Bug 3 - causes runtime errors in specific scenarios)

All bugs are related to missing null checks or incorrect assumptions about data structure. The fixes are straightforward and should be implemented before deployment.



