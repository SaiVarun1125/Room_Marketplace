import Link from 'next/link'
import { Search, ShieldCheck, MessageSquare, MapPin } from 'lucide-react'

export default function HomePage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-brand-50 to-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <MapPin size={14}/>Springfield, MO — Missouri State · Drury · Evangel
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-5">
            Find your next room,<br/><span className="text-brand-600">without the guesswork.</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            Verified room listings and roommate matches for students and early-career movers in Springfield. No scams, no stale posts.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/listings" className="btn-primary text-base px-6 py-3"><Search size={18}/>Browse rooms</Link>
            <Link href="/listings/new" className="btn-secondary text-base px-6 py-3">List your room</Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: 'Verified listings', desc: 'Every listing is reviewed. Email verification keeps bad actors out.' },
            { icon: Search,      title: 'Fast matching',    desc: 'Filter by budget, move-in date, and lifestyle. Find your match in minutes.' },
            { icon: MessageSquare, title: 'Secure messaging', desc: 'Chat directly with posters. Your contact info stays private until you\'re ready.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6">
              <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center mb-4">
                <Icon size={20} className="text-brand-600"/>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-600 text-white">
        <div className="max-w-3xl mx-auto px-4 py-14 text-center">
          <h2 className="text-3xl font-bold mb-4">Have a room to share?</h2>
          <p className="text-brand-100 mb-8">List for free and reach verified seekers near Missouri State, Drury, and Evangel.</p>
          <Link href="/listings/new" className="bg-white text-brand-700 hover:bg-brand-50 btn text-base px-8 py-3">Post your listing</Link>
        </div>
      </section>
    </div>
  )
}
