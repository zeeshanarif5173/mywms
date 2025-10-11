'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import {
  BuildingOfficeIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface MeetingRoom {
  id: string
  name: string
  capacity: number
  location: string
  amenities: string[]
  isActive: boolean
}

interface Booking {
  id: string
  customerId: string
  roomId: string
  date: string
  startTime: string
  endTime: string
  duration: number
  status: 'Confirmed' | 'Cancelled' | 'Completed'
  purpose: string
  createdAt: string
  updatedAt: string
}

export default function MeetingRoomsCustomer() {
  const { data: session } = useSession()
  const [meetingRooms, setMeetingRooms] = useState<MeetingRoom[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [bookingData, setBookingData] = useState({
    startTime: '',
    endTime: '',
    purpose: ''
  })
  const [dailyHoursUsed, setDailyHoursUsed] = useState(0)
  const [monthlyHoursUsed, setMonthlyHoursUsed] = useState(0)
  const [monthlyLimit, setMonthlyLimit] = useState(20)

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [roomsResponse, bookingsResponse, limitsResponse] = await Promise.all([
          fetch('/api/meeting-rooms/available'),
          fetch(`/api/meeting-rooms/customer-bookings/${session?.user?.id}`),
          fetch(`/api/meeting-rooms/limits/${session?.user?.id}`)
        ])

        if (roomsResponse.ok) {
          const rooms = await roomsResponse.json()
          setMeetingRooms(rooms)
        }

        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json()
          setBookings(bookingsData)
        }

        if (limitsResponse.ok) {
          const limits = await limitsResponse.json()
          setDailyHoursUsed(limits.dailyHours)
          setMonthlyHoursUsed(limits.monthlyHours)
          setMonthlyLimit(limits.monthlyLimit)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      loadData()
    }
  }, [session])

  // Generate available time slots
  const generateTimeSlots = (roomId: string, date: string) => {
    const slots = []
    const startHour = 9 // 9 AM
    const endHour = 18 // 6 PM
    const now = new Date()
    const selectedDateObj = new Date(date)
    const isToday = selectedDateObj.toDateString() === now.toDateString()
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const nextTime = minute === 30 ? `${(hour + 1).toString().padStart(2, '0')}:00` : `${hour.toString().padStart(2, '0')}:30`
        
        if (nextTime <= '18:00') {
          // Check if this time slot is in the past (only for today)
          if (isToday) {
            const slotTime = new Date(`${date}T${time}:00`)
            if (slotTime <= now) {
              continue // Skip past time slots
            }
          }
          
          slots.push({ start: time, end: nextTime })
        }
      }
    }
    
    return slots
  }

  const handleRoomSelect = (room: MeetingRoom) => {
    setSelectedRoom(room)
    setSelectedDate('')
    setAvailableSlots([])
    setBookingData({ startTime: '', endTime: '', purpose: '' })
    setShowBookingModal(true)
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    if (selectedRoom) {
      const slots = generateTimeSlots(selectedRoom.id, date)
      setAvailableSlots(slots.map(slot => `${slot.start}-${slot.end}`))
    }
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRoom || !selectedDate) return

    try {
      const response = await fetch('/api/meeting-rooms/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          date: selectedDate,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          purpose: bookingData.purpose
        })
      })

      if (response.ok) {
        // Reload bookings
        const bookingsResponse = await fetch(`/api/meeting-rooms/customer-bookings/${session?.user?.id}`)
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json()
          setBookings(bookingsData)
        }
        setShowBookingModal(false)
        setSelectedRoom(null)
        setSelectedDate('')
        setBookingData({ startTime: '', endTime: '', purpose: '' })
      } else {
        const error = await response.json()
        alert(`Booking failed: ${error.error || 'Failed to book meeting room'}`)
      }
    } catch (error) {
      console.error('Error booking meeting room:', error)
      alert('Failed to book meeting room')
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      const response = await fetch(`/api/meeting-rooms/customer-bookings/booking/${bookingId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Reload bookings to get updated status instead of filtering out
        const bookingsResponse = await fetch(`/api/meeting-rooms/customer-bookings/${session?.user?.id}`)
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json()
          setBookings(bookingsData)
        }
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading meeting rooms...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Meeting Rooms</h1>
                <p className="text-sm text-gray-500">Book meeting rooms for your meetings</p>
              </div>
            </div>
            <a
              href="/dashboard"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Usage Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Daily Hours Used</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-1">{dailyHoursUsed / 60}h</p>
              <p className="text-xs text-gray-500">Max: 2 hours per day</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Monthly Hours Used</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-1">{monthlyHoursUsed / 60}h</p>
              <p className="text-xs text-gray-500">Limit: {monthlyLimit}h per month</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <BuildingOfficeIcon className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Total Bookings</span>
              </div>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {bookings.length}
              </p>
              <p className="text-xs text-gray-500">
                {bookings.filter(b => b.status === 'Confirmed').length} confirmed • {bookings.filter(b => b.status === 'Cancelled').length} cancelled • {bookings.filter(b => b.status === 'Completed').length} completed
              </p>
            </div>
          </div>
        </div>

        {/* Available Meeting Rooms */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Meeting Rooms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetingRooms.map((room) => (
              <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{room.name}</h4>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <UsersIcon className="w-4 h-4" />
                        <span>{room.capacity} people</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{room.location}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    Available
                  </span>
                </div>

                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Amenities</h5>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleRoomSelect(room)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Book Room</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* My Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">My Bookings</h3>
          </div>
          
          {bookings.length === 0 ? (
            <div className="p-8 text-center">
              <BuildingOfficeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No bookings found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <div key={booking.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {meetingRooms.find(room => room.id === booking.roomId)?.name || 'Unknown Room'}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.status === 'Confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : booking.status === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : booking.status === 'Completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{formatDate(booking.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <UsersIcon className="w-4 h-4" />
                          <span>{booking.duration / 60}h duration</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">Purpose: {booking.purpose}</span>
                        </div>
                      </div>
                    </div>
                    {booking.status === 'Confirmed' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="ml-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Book {selectedRoom.name}</h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => handleDateSelect(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // 30 days in future
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {selectedDate && availableSlots.length > 0 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Time Slot
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {availableSlots.map((slot, index) => {
                          const [start, end] = slot.split('-')
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setBookingData({
                                ...bookingData,
                                startTime: start,
                                endTime: end
                              })}
                              className={`p-2 text-sm rounded-lg border transition-colors ${
                                bookingData.startTime === start
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {formatTime(start)} - {formatTime(end)}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purpose
                      </label>
                      <input
                        type="text"
                        required
                        value={bookingData.purpose}
                        onChange={(e) => setBookingData({ ...bookingData, purpose: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Client Meeting, Team Standup"
                      />
                    </div>
                  </>
                )}

                {selectedDate && availableSlots.length === 0 && (
                  <div className="text-center py-4">
                    <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-gray-500">No available slots for this date.</p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={!selectedDate || !bookingData.startTime || !bookingData.purpose}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Book Room
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
