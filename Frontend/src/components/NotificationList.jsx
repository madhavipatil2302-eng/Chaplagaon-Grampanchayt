import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GetAllNotification, ViewNotificationById } from '../Services/GetNotification'
import { User, Clock } from 'lucide-react'

export default function NotificationList({ onNotificationClick }) {
  const [notifications, setNotifications] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const GetAllNotificationData = async () => {
      const NotificationResponse = await GetAllNotification();

      if (NotificationResponse && NotificationResponse.success) {
        setNotifications(NotificationResponse.data || []);
      }
    }
    GetAllNotificationData();
  }, [])

  const handleNotificationClick = async (notification) => {
    const notificationId = notification?._id || notification?.id || notification?.token;
    console.log("Clicked Notification ID:", notificationId, "Full Item:", notification);

    if (onNotificationClick && typeof onNotificationClick === 'function') {
      onNotificationClick(notificationId, notification);
    }

    if (notificationId) {
      navigate(`/view-notification/${notificationId}`);
    }
  }

  return (
    <div className="flex min-h-[150px] max-h-[350px] flex-col gap-2 overflow-y-auto pr-1">
      {notifications.length === 0 ? (
        <div className="grid h-full place-items-center text-sm font-bold text-neutral-400 mt-10">
          No New Notifications
        </div>
      ) : (
        notifications.map((notification, index) => {
          const notificationId = notification._id || notification.id || notification.token || index;
          return (
            <div
              key={notificationId}
              onClick={() => handleNotificationClick(notification)}
              className="group flex cursor-pointer gap-3 rounded-xl border border-neutral-100 bg-white p-3 shadow-sm transition-all hover:border-emerald-200 hover:bg-emerald-50 active:scale-[0.98]"
            >
              {/* User Icon Avatar */}
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <User size={20} />
              </div>

              {/* Notification Content */}
              <div className="flex min-w-0 flex-1 flex-col">
                <h4 className="truncate text-sm font-bold text-neutral-900">
                  {notification.name || 'Citizen'}
                </h4>
                <p className="mt-0.5 line-clamp-1 text-xs font-semibold text-neutral-600">
                  {notification.complint || 'Submitted a new complaint'}
                </p>

                <div className="mt-2 flex items-center gap-3 text-[10px] font-bold text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : 'Just now'}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 ${notification.status === 'pending'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-emerald-100 text-emerald-700'
                    }`}>
                    {notification.status || 'pending'}
                  </span>
                </div>
              </div>

              {/* Unread Indicator */}
              <div className="flex flex-col items-end justify-center">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
