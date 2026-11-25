import { Link } from 'react-router-dom'
import { ArrowLeft, Film, Headphones, Music2 } from 'lucide-react'
import ReminisceSection from '../components/ReminisceSection'

export default function ListeningParty() {
  return (
    <div className="animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-copper-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to store
        </Link>
      </div>

      <ReminisceSection />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: Headphones,
              title: 'Listening Party Only',
              desc: 'Tracks from the 2022 Reminisce EP are archived exclusively for streaming and creative showcase — never sold as generic leases.',
            },
            {
              icon: Film,
              title: 'Film, Trailer & Cultural Scores',
              desc: 'Directors, brands, and visual storytellers can commission original Ethiopian-inspired scores or bespoke themes tailored to picture.',
            },
            {
              icon: Music2,
              title: 'Need Beats Ready Today?',
              desc: 'Head to the Beat Vault to stream and license ready-to-release trap & drill instrumentals instantly.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass rounded-2xl border border-line p-6 space-y-2">
              <Icon className="w-5 h-5 text-copper-ink" />
              <h3 className="font-bold text-ink text-base">{title}</h3>
              <p className="text-xs text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
