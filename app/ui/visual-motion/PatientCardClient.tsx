'use client';

import { useState } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import { Patient } from '@/app/lib/definitions';
import { UserIcon } from '@heroicons/react/24/outline'; // oppure /solid se vuoi piena

export default function PatientCardClient({ patients }: { patients: Patient[] }) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selected = patients.find((p) => p.id === selectedId);

    return (
        <div className="flex flex-col justify-center items-center p-6 gap-16 h-full">
            <div className="flex flex-col items-center space-y-4">
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

            <div className={clsx("flex flex-col justify-start items-center gap-16", 
                selected ? '' : 'opacity-0')}>

                {/* Informazioni pazienti */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-full">
                        <p className="font-semibold text-brand-main">Problema lamentato:</p>
                        <p className="text-gray-800">Lussazione spalla - 23/02/2025</p>
                    </div>

                    <div className="w-full">
                        <p className="font-semibold text-brand-main">Stato:</p>
                        <div className="flex items-center space-x-2">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        <span className="text-gray-800">Attivo</span>
                        </div>
                    </div>
                </div>

                <div className="w-full flex justify-center">
                    <button className="mt-2 px-4 py-2 bg-brand-main text-white rounded-md hover:bg-brand-700 self-start">
                        Scheda Paziente
                    </button>
                </div>

            </div>
            
            
        </div>
    );
}
