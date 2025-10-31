/**
 * CASE STUDY IMAGES - IMPLEMENTATION EXAMPLES
 *
 * This file provides React/Next.js code examples for implementing
 * the case study images in your Videbimus AI website.
 */

import Image from 'next/image';

// ============================================================================
// EXAMPLE 1: Featured Hero Image (Case Study Landing Page)
// ============================================================================

export function CaseStudyHero() {
  return (
    <section className="relative h-[600px] w-full">
      <Image
        src="/images/case-studies/petroverse/petroverse-featured.jpg"
        alt="Offshore oil rig with advanced monitoring equipment for predictive maintenance"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30">
        <div className="container mx-auto px-6 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl font-bold mb-4">PetroVerse</h1>
            <p className="text-xl mb-2">Oil & Gas Industry</p>
            <p className="text-lg opacity-90">
              Predictive maintenance AI reducing costs by 30% and improving uptime by 45%
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// EXAMPLE 2: Solution Showcase Grid
// ============================================================================

export function SolutionShowcase() {
  const solutions = [
    {
      image: '/images/case-studies/petroverse/petroverse-solution-dashboard.jpg',
      alt: 'Predictive maintenance dashboard showing equipment health metrics',
      title: 'Real-Time Monitoring',
      description: 'AI-powered dashboard tracking equipment health 24/7'
    },
    {
      image: '/images/case-studies/petroverse/petroverse-solution-sensors.jpg',
      alt: 'Industrial IoT sensors monitoring oil & gas equipment',
      title: 'IoT Integration',
      description: 'Smart sensors collecting critical operational data'
    },
    {
      image: '/images/case-studies/petroverse/petroverse-solution-monitoring.jpg',
      alt: 'Real-time equipment monitoring interface for oil & gas operations',
      title: 'Predictive Analytics',
      description: 'Machine learning models predicting failures before they occur'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">The Solution</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={solution.image}
                  alt={solution.alt}
                  fill
                  className="object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{solution.title}</h3>
                <p className="text-gray-600">{solution.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// EXAMPLE 3: Results Section with Metrics
// ============================================================================

export function ResultsSection() {
  const metrics = [
    {
      image: '/images/case-studies/petroverse/petroverse-results-metrics.jpg',
      alt: 'Cost savings metrics showing 30% reduction in maintenance costs',
      value: '30%',
      label: 'Cost Reduction',
      description: 'Annual maintenance costs reduced from $10M to $7M'
    },
    {
      image: '/images/case-studies/petroverse/petroverse-results-uptime.jpg',
      alt: 'Equipment uptime metrics showing 45% improvement',
      value: '45%',
      label: 'Uptime Improvement',
      description: 'Equipment availability increased from 72% to 92%'
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">Results That Matter</h2>
        <div className="grid md:grid-cols-2 gap-12">
          {metrics.map((metric, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={metric.image}
                  alt={metric.alt}
                  fill
                  className="object-cover"
                  loading="lazy"
                />
              </div>
              <div className="text-6xl font-bold text-blue-600 mb-2">{metric.value}</div>
              <div className="text-2xl font-semibold mb-2">{metric.label}</div>
              <p className="text-gray-600 max-w-md">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// EXAMPLE 4: Case Study Card (For Case Studies Index Page)
// ============================================================================

export function CaseStudyCard() {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-64">
        <Image
          src="/images/case-studies/petroverse/petroverse-featured.jpg"
          alt="Offshore oil rig with advanced monitoring equipment for predictive maintenance"
          fill
          className="object-cover"
          loading="lazy"
        />
        <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          Oil & Gas
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-2">PetroVerse</h3>
        <p className="text-gray-600 mb-4">
          Predictive maintenance AI reducing operational costs and improving equipment uptime
        </p>
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <div className="text-2xl font-bold text-blue-600">30%</div>
            <div className="text-sm text-gray-500">Cost Reduction</div>
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-blue-600">45%</div>
            <div className="text-sm text-gray-500">Uptime Increase</div>
          </div>
        </div>
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Read Case Study
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Complete Case Study Page Layout
// ============================================================================

export default function CaseStudyPage() {
  return (
    <main>
      {/* Hero Section */}
      <CaseStudyHero />

      {/* Challenge Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-4xl font-bold mb-6">The Challenge</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            PetroVerse faced critical challenges with unexpected equipment failures
            causing costly downtime and safety risks in their offshore operations.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Traditional maintenance schedules were inefficient, leading to both
            over-maintenance and catastrophic failures.
          </p>
        </div>
      </section>

      {/* Solution Section */}
      <SolutionShowcase />

      {/* Implementation Timeline */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-4xl font-bold mb-12 text-center">Implementation</h2>
          {/* Timeline content here */}
        </div>
      </section>

      {/* Results Section */}
      <ResultsSection />

      {/* Testimonial */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <blockquote className="text-2xl italic text-gray-700 mb-6">
            "Videbimus AI's predictive maintenance solution has transformed our operations.
            We've not only saved millions but also significantly improved safety."
          </blockquote>
          <div className="font-semibold">John Smith</div>
          <div className="text-gray-600">VP of Operations, PetroVerse</div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Operations?</h2>
          <p className="text-xl mb-8 opacity-90">
            See how Videbimus AI can deliver similar results for your organization
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Schedule a Consultation
          </button>
        </div>
      </section>
    </main>
  );
}

// ============================================================================
// RESPONSIVE IMAGE OPTIMIZATION TIPS
// ============================================================================

/*
1. Use Next.js Image component for automatic optimization
2. Implement lazy loading for below-fold images
3. Use priority prop only for above-fold images
4. Consider creating WebP versions for better compression
5. Implement responsive breakpoints:

<Image
  src="/images/case-studies/petroverse/petroverse-featured.jpg"
  alt="..."
  width={1200}
  height={800}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>

6. Add blur placeholder for better UX:

<Image
  src="..."
  alt="..."
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
*/

// ============================================================================
// SEO OPTIMIZATION
// ============================================================================

/*
1. Use descriptive alt text (already provided in manifest)
2. Implement structured data for case studies:

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CaseStudy",
  "name": "PetroVerse AI Implementation",
  "image": "https://videbimus.ai/images/case-studies/petroverse/petroverse-featured.jpg",
  "description": "Predictive maintenance AI reducing costs by 30% and improving uptime by 45%",
  "provider": {
    "@type": "Organization",
    "name": "Videbimus AI"
  }
};

3. Add Open Graph meta tags for social sharing:

<meta property="og:image" content="/images/case-studies/petroverse/petroverse-featured.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="800" />
*/
