'use client'

import { useState } from 'react'
import { DocumentTypesTable } from '@/components/settings/document-types/document-types-table'
import { DocumentTypeDialog } from '@/components/settings/document-types/document-type-dialog'
import { DocumentType } from '@/types/user-documents'

interface DocumentTypesPageClientProps {
    initialData: DocumentType[]
}

export function DocumentTypesPageClient({ initialData }: DocumentTypesPageClientProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    return (
        <div className="space-y-4">
            <DocumentTypesTable data={initialData} onNew={() => setIsCreateOpen(true)} />

            <DocumentTypeDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
            />
        </div>
    )
}
