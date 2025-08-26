import discord
from discord.ext import commands, tasks
import json
import asyncio
import random
import datetime
import os
from typing import Dict, List, Optional
import re

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Bot configuration
intents = discord.Intents.default()
intents.message_content = True
intents.members = True
intents.guilds = True

bot = commands.Bot(command_prefix='!', intents=intents)

# Data storage with proper error handling
class DataManager:
    def __init__(self):
        self.data_file = 'bot_data.json'
        self.data = self.load_data()
    
    def load_data(self):
        try:
            if os.path.exists(self.data_file):
                with open(self.data_file, 'r') as f:
                    return json.load(f)
        except Exception as e:
            print(f"Error loading data: {e}")
        
        # Return default data structure
        return {
            'giveaways': {},
            'counters': {},
            'tickets': {},
            'xp': {},
            'security': {
                'banned_words': ['spam', 'scam'],
                'warnings': {}
            }
        }
    
    def save_data(self):
        try:
            with open(self.data_file, 'w') as f:
                json.dump(self.data, f, indent=4, default=str)
        except Exception as e:
            print(f"Error saving data: {e}")

# [Keep all your existing classes and commands here - GiveawayManager, CounterManager, etc.]

# At the very end, replace the bot.run() line with:
if __name__ == "__main__":
    token = os.getenv('DISCORD_TOKEN')
    if not token:
        print("Error: DISCORD_TOKEN environment variable not found!")
        exit(1)
    
    try:
        bot.run(token)
    except Exception as e:
        print(f"Error starting bot: {e}")
