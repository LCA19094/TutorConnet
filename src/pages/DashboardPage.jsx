import React from 'react';
import { BarChart, TrendingUp, Users, Award } from 'lucide-react';

function DashboardPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Mi Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Sesiones Completadas</p>
              <p className="text-3xl font-bold mt-2">12</p>
            </div>
            <BarChart className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Calificación Promedio</p>
              <p className="text-3xl font-bold mt-2">4.8 ⭐</p>
            </div>
            <Award className="text-yellow-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Próxima Sesión</p>
              <p className="text-lg font-bold mt-2">Hoy a las 15:00</p>
            </div>
            <Users className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Horas Totales</p>
              <p className="text-3xl font-bold mt-2">36 hrs</p>
            </div>
            <TrendingUp className="text-purple-600" size={32} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Acciones Rápidas</h2>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition font-semibold">
              🔍 Buscar nuevo tutor
            </button>
            <button className="w-full text-left px-4 py-3 bg-green-50 text-green-600 rounded hover:bg-green-100 transition font-semibold">
              📅 Agendar sesión
            </button>
            <button className="w-full text-left px-4 py-3 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition font-semibold">
              ⭐ Ver mis calificaciones
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Próximas Sesiones</h2>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded">
              <p className="font-semibold">Matemáticas</p>
              <p className="text-sm text-gray-600">Hoy - 15:00 con María García</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="font-semibold">Inglés</p>
              <p className="text-sm text-gray-600">Mañana - 10:00 con John Smith</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
