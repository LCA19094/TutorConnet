import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, TrendingUp, Zap } from 'lucide-react';

function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 rounded-lg mb-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Aprende de los Mejores Tutores
          </h1>
          <p className="text-xl mb-8 text-gray-100">
            Conecta con tutores calificados para clases en línea o presenciales
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/tutors"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Buscar Tutores
            </Link>
            <Link
              to="/register"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mb-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          ¿Por qué elegir TutorConnect?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <Users size={32} />,
              title: 'Tutores Verificados',
              description: 'Todos nuestros tutores son verificados y tienen experiencia comprobada'
            },
            {
              icon: <BookOpen size={32} />,
              title: 'Múltiples Materias',
              description: 'Encuentra tutores en todas las materias y niveles educativos'
            },
            {
              icon: <TrendingUp size={32} />,
              title: 'Sistema de Reputación',
              description: 'Calificaciones y reseñas auténticas de estudiantes reales'
            },
            {
              icon: <Zap size={32} />,
              title: 'Reserva Instantánea',
              description: 'Reserva sesiones al instante como en Uber o Rappi'
            }
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
            >
              <div className="text-blue-600 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-100 py-16 rounded-lg mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">5,000+</div>
            <p className="text-gray-600">Tutores Disponibles</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">50,000+</div>
            <p className="text-gray-600">Estudiantes Activos</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">100,000+</div>
            <p className="text-gray-600">Sesiones Completadas</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-16 rounded-lg text-center">
        <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar?</h2>
        <p className="text-lg mb-8 text-gray-100">
          Crea tu cuenta ahora y encuentra el tutor perfecto para ti
        </p>
        <Link
          to="/register"
          className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Registrarse Gratis
        </Link>
      </section>
    </div>
  );
}

export default HomePage;
