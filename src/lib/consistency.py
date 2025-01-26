from datetime import datetime, timedelta
from typing import Dict, Any
import json

class ConsistencyTracker:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.data_file = f"consistency_{user_id}.json"
        self.load_data()

    def load_data(self) -> None:
        try:
            with open(self.data_file, 'r') as f:
                self.user_data = json.load(f)
        except FileNotFoundError:
            self.user_data = {
                'streak': 0,
                'last_active': None,
                'total_visits': 0,
                'daily_activity': {}
            }

    def save_data(self) -> None:
        with open(self.data_file, 'w') as f:
            json.dump(self.user_data, f)

    def track_activity(self, activity_type: str) -> Dict[str, Any]:
        today = datetime.now().strftime('%Y-%m-%d')
        
        # Update total visits
        self.user_data['total_visits'] += 1
        
        # Update daily activity
        if today not in self.user_data['daily_activity']:
            self.user_data['daily_activity'][today] = {
                'visits': 1,
                'activities': [activity_type]
            }
        else:
            self.user_data['daily_activity'][today]['visits'] += 1
            if activity_type not in self.user_data['daily_activity'][today]['activities']:
                self.user_data['daily_activity'][today]['activities'].append(activity_type)

        # Update streak
        if self.user_data['last_active']:
            last_active = datetime.strptime(self.user_data['last_active'], '%Y-%m-%d')
            days_diff = (datetime.now() - last_active).days
            
            if days_diff == 1:  # Consecutive day
                self.user_data['streak'] += 1
            elif days_diff > 1:  # Streak broken
                self.user_data['streak'] = 1
            # If same day, streak remains unchanged
        else:
            self.user_data['streak'] = 1

        self.user_data['last_active'] = today
        self.save_data()
        
        return {
            'streak': self.user_data['streak'],
            'total_visits': self.user_data['total_visits'],
            'today_visits': self.user_data['daily_activity'][today]['visits']
        }

    def get_stats(self) -> Dict[str, Any]:
        return {
            'streak': self.user_data['streak'],
            'total_visits': self.user_data['total_visits'],
            'last_active': self.user_data['last_active'],
            'daily_activity': self.user_data['daily_activity']
        }

    def get_weekly_activity(self) -> Dict[str, int]:
        today = datetime.now()
        weekly_data = {}
        
        for i in range(7):
            date = (today - timedelta(days=i)).strftime('%Y-%m-%d')
            if date in self.user_data['daily_activity']:
                weekly_data[date] = self.user_data['daily_activity'][date]['visits']
            else:
                weekly_data[date] = 0
                
        return weekly_data
