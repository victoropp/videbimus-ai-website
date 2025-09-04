import { createTRPCRouter } from "./init"
import { authRouter } from "./routers/auth"
import { contactRouter } from "./routers/contact"
import { newsletterRouter } from "./routers/newsletter"
import { projectsRouter } from "./routers/projects"
import { testimonialsRouter } from "./routers/testimonials"
import { teamRouter } from "./routers/team"
import { caseStudiesRouter } from "./routers/case-studies"
import { financialRouter } from "./routers/financial"
import { analyticsRouter } from "./routers/analytics"
import { consultationRouter } from "./routers/consultation"

export const appRouter = createTRPCRouter({
  auth: authRouter,
  contact: contactRouter,
  newsletter: newsletterRouter,
  projects: projectsRouter,
  testimonials: testimonialsRouter,
  team: teamRouter,
  caseStudies: caseStudiesRouter,
  financial: financialRouter,
  analytics: analyticsRouter,
  consultation: consultationRouter,
})

export type AppRouter = typeof appRouter
