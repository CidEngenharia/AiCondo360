import React from 'react';
import { motion } from 'motion/react';
import { Plus, Car, FileText, Key, Info } from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';

const CARS = [
  { id: 1, model: 'Honda Civic', plate: 'BRA-2E19', color: 'Prata', slot: 'A-42', type: 'Carro' },
  { id: 2, model: 'Yamaha MT-03', plate: 'XYZ-9090', color: 'Preto', slot: 'M-12', type: 'Moto' }
];

export const Garagem: React.FC = () => {
  return (
    <div className="space-y-6">
      <FeatureHeader 
        icon={Car}
        title="Veículos e Garagem"
        description="Gerencie as permissões de acesso à garagem e o cadastro dos seus veículos."
        color="bg-slate-700"
      />

      <div className="flex justify-end">
        <button className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-slate-700/20 active:scale-[0.98]">
          <Plus size={18} />
          <span>Cadastrar Veículo</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Car className="text-slate-400" size={20} />
            Meus Veículos
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {CARS.map((car, index) => (
              <motion.div 
                key={car.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:shadow-slate-500/10 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="px-3 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-bold font-mono text-sm rounded-lg border border-slate-200 dark:border-slate-600 shadow-inner">
                    {car.plate}
                  </div>
                </div>
                
                <div className="pr-20 mb-6 mt-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">{car.model}</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{car.color} • {car.type}</p>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 flex items-center gap-4 transition-colors group-hover:bg-slate-100 dark:group-hover:bg-slate-900">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
                    <Key size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Vaga Associada</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{car.slot}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Info className="text-slate-400" size={20} />
            Informações
          </h2>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Vagas da Unidade</h4>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-600 dark:text-slate-400">Vagas Totais</span>
                <span className="font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">2</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-600 dark:text-slate-400">Vagas em Uso</span>
                <span className="font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">2</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3 pt-5 border-t border-slate-200 dark:border-slate-700">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-lg shrink-0 mt-0.5">
                <FileText size={16} className="text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                As credenciais de acesso (tags) estão vinculadas à placa do veículo registrado. Mantenha atualizado.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

