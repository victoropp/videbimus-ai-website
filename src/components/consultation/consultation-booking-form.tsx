'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, Building, MessageSquare, DollarSign, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/trpc/react'
import { useRouter } from 'next/navigation'
import { ConsultationType } from '@/types/consultation'

interface ConsultationBookingData {
  title: string
  description?: string
  type: ConsultationType
  duration: number
  scheduledAt: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  company?: string
  projectDescription: string
  budget?: string
  urgency: 'low' | 'medium' | 'high'
}

const consultationTypes = [
  {
    value: 'DISCOVERY',
    label: 'Discovery Session',
    description: 'Initial consultation to understand your needs',
    duration: 60,
    badge: 'Popular'
  },
  {
    value: 'STRATEGY',
    label: 'Strategy Planning',
    description: 'Develop AI strategy and roadmap',
    duration: 90,
  },
  {
    value: 'TECHNICAL',
    label: 'Technical Review',
    description: 'Deep-dive technical consultation',
    duration: 120,
  },
  {
    value: 'TRAINING',
    label: 'Training Session',
    description: 'Team training and knowledge transfer',
    duration: 180,
  },
  {
    value: 'REVIEW',
    label: 'Project Review',
    description: 'Review existing projects and solutions',
    duration: 90,
  },
  {
    value: 'FOLLOW_UP',
    label: 'Follow-up Session',
    description: 'Continue previous discussions',
    duration: 45,
  },
]

const budgetRanges = [
  { value: 'under-10k', label: 'Under $10,000' },
  { value: '10k-50k', label: '$10,000 - $50,000' },
  { value: '50k-100k', label: '$50,000 - $100,000' },
  { value: '100k-500k', label: '$100,000 - $500,000' },
  { value: '500k-plus', label: '$500,000+' },
  { value: 'not-sure', label: 'Not sure yet' },
]

export function ConsultationBookingForm() {
  const [selectedType, setSelectedType] = useState<ConsultationType | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const createConsultation = api.consultation.create.useMutation({
    onSuccess: (result) => {
      toast({
        title: 'Consultation Booked!',
        description: 'We\'ll be in touch shortly to confirm your appointment.',
      })
      router.push(`/consultation/${result.consultation.id}`)
    },
    onError: (error) => {
      toast({
        title: 'Booking Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ConsultationBookingData>()

  const watchedType = watch('type')
  const selectedTypeInfo = consultationTypes.find(t => t.value === watchedType)

  const onSubmit = async (data: ConsultationBookingData) => {
    setIsSubmitting(true)
    
    try {
      // Create the consultation
      await createConsultation.mutateAsync({
        title: data.title,
        description: data.description,
        type: data.type,
        duration: data.duration,
        scheduledAt: new Date(data.scheduledAt),
      })
    } catch (error) {
      // Error is handled by the mutation
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Choose Consultation Type</CardTitle>
            <CardDescription>
              Select the type of consultation that best fits your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {consultationTypes.map((type) => (
                <motion.div
                  key={type.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      watchedType === type.value
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => {
                      setValue('type', type.value as ConsultationType)
                      setValue('duration', type.duration)
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{type.label}</h3>
                      <div className="flex items-center gap-2">
                        {type.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {type.badge}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {type.duration} min
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            {errors.type && (
              <p className="text-red-500 text-sm mt-2">Please select a consultation type</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Consultation Details</CardTitle>
            <CardDescription>
              Provide details about your consultation session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <input
                type="hidden"
                {...register('type', { required: 'Please select a consultation type' })}
              />

              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Consultation Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., AI Strategy Discussion for E-commerce Platform"
                  {...register('title', { 
                    required: 'Title is required',
                    minLength: { value: 10, message: 'Title must be at least 10 characters' }
                  })}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Provide any additional context or specific topics you'd like to discuss..."
                  {...register('description')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Preferred Date & Time
                  </Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
                    {...register('scheduledAt', { required: 'Please select a date and time' })}
                  />
                  {errors.scheduledAt && (
                    <p className="text-red-500 text-sm">{errors.scheduledAt.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Duration (minutes)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="30"
                    max="480"
                    {...register('duration', { 
                      required: 'Duration is required',
                      min: { value: 30, message: 'Minimum duration is 30 minutes' },
                      max: { value: 480, message: 'Maximum duration is 8 hours' }
                    })}
                  />
                  {errors.duration && (
                    <p className="text-red-500 text-sm">{errors.duration.message}</p>
                  )}
                </div>
              </div>

              {selectedTypeInfo && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      {selectedTypeInfo.label}
                    </Badge>
                    <span className="text-sm text-blue-600">
                      Recommended duration: {selectedTypeInfo.duration} minutes
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    {selectedTypeInfo.description}
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              We'll use this information to confirm your appointment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="clientName"
                    placeholder="John Doe"
                    {...register('clientName', { required: 'Name is required' })}
                  />
                  {errors.clientName && (
                    <p className="text-red-500 text-sm">{errors.clientName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email Address</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="john@company.com"
                    {...register('clientEmail', { 
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
                    })}
                  />
                  {errors.clientEmail && (
                    <p className="text-red-500 text-sm">{errors.clientEmail.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Phone (Optional)</Label>
                  <Input
                    id="clientPhone"
                    placeholder="+1 (555) 123-4567"
                    {...register('clientPhone')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Company (Optional)
                  </Label>
                  <Input
                    id="company"
                    placeholder="Company Name"
                    {...register('company')}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Help us understand your project requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="projectDescription">Project Description</Label>
                <Textarea
                  id="projectDescription"
                  placeholder="Tell us about your project, current challenges, and what you're hoping to achieve..."
                  {...register('projectDescription', { 
                    required: 'Project description is required',
                    minLength: { value: 20, message: 'Please provide more details about your project' }
                  })}
                />
                {errors.projectDescription && (
                  <p className="text-red-500 text-sm">{errors.projectDescription.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Budget Range (Optional)
                  </Label>
                  <Select onValueChange={(value) => setValue('budget', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency" className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Priority Level
                  </Label>
                  <Select onValueChange={(value) => setValue('urgency', value as 'low' | 'medium' | 'high')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - No rush</SelectItem>
                      <SelectItem value="medium">Medium - Within a few weeks</SelectItem>
                      <SelectItem value="high">High - ASAP</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.urgency && (
                    <p className="text-red-500 text-sm">{errors.urgency.message}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-end space-x-4"
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Booking...
            </div>
          ) : (
            'Book Consultation'
          )}
        </Button>
      </motion.div>
    </div>
  )
}