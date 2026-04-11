import { 
  Users, 
  CloudRain, 
  Wheat, 
  Activity 
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      
      {/* Ucapan Selamat Datang */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Selamat Datang, Bapak Kades! 👋</h1>
        <p className="text-gray-600 mt-2">
          Ini adalah pusat kendali Sistem Prediksi Masa Tanam Desa Pisangsambo. 
          Anda dapat mengelola data cuaca dan riwayat panen di sini.
        </p>
      </div>

      {/* Kartu Statistik (Nanti datanya kita fetch dari PostgreSQL) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-lg">
            <CloudRain size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Data Iklim (Tahun)</p>
            <h3 className="text-2xl font-bold text-gray-800">1</h3>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-yellow-50 text-yellow-600 rounded-lg">
            <Wheat size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Histori Panen</p>
            <h3 className="text-2xl font-bold text-gray-800">2021</h3>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-lg">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Akurasi AI</p>
            <h3 className="text-2xl font-bold text-gray-800">99.3%</h3>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Prediksi Web</p>
            <h3 className="text-2xl font-bold text-gray-800">12</h3>
          </div>
        </div>

      </div>

    </div>
  );
}
