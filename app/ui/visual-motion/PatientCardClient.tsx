'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Patient } from '@/app/lib/definitions';
import { UserIcon } from '@heroicons/react/24/outline'; // oppure /solid se vuoi piena

export default function PatientCardClient({ patients }: { patients: Patient[] }) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selected = patients.find((p) => p.id === selectedId);

    return (
        <div className="flex flex-col items-center p-6 gap-4">
        {/* Avatar */}
            <div className="w-28 h-28 relative rounded-full overflow-hidden bg-gray-200">
                {selected?.image_url ? (
                <Image
                    src={selected.image_url}
                    alt={selected.name}
                    fill
                    className="object-cover"
                />
                ) : (
                <div className="w-full h-full flex items-center text-center justify-center text-gray-500 text-sm">
                    <UserIcon className="w-20 h-20" />
                </div>
                )}
            </div>

        {/* Dropdown che sembra un titolo */}
            <select
            aria-label="Seleziona un paziente"
            onChange={(e) => setSelectedId(e.target.value)}
            value={selectedId ?? ''}
            className="text-lg font-semibold text-center text-gray-800 bg-transparent appearance-none cursor-pointer outline-none border-none focus:ring-0 focus:outline-none"
            >
            <option value="" className="text-gray-500">
                Seleziona un paziente
            </option>
            {patients.map((p) => (
                <option key={p.id} value={p.id}>
                {p.name}
                </option>
            ))}
            </select>
        </div>
    );
}
