import random
import asyncio
import os
import discord
from discord.ext import commands
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv('DISCORD_TOKEN')
GUILD = os.getenv('DISCORD_GUILD') # note that the .env file needs an actual name to work with this

description = '''First attempt at a bot, use BET! to use commands'''

intents = discord.Intents.default()
intents.members = True
intents.message_content = True

bot = commands.Bot(command_prefix = 'BET!', description = description, intents = intents)

@bot.event
async def on_ready():
    print(f'Logged in as {bot.user} (ID: {bot.user.id})')
    print('------')

@bot.command()
async def add(ctx, left: int, right: int):
    """Adds two numbers together."""
    await ctx.send(left + right)

@bot.command()
async def poll(ctx, option1: str, option2: str):
    poll_message = await ctx.channel.send(f'Poll: {option1} or {option2}?')
    await poll_message.add_reaction('🔴') # Red emoji
    await poll_message.add_reaction('🔵') # Blue emoji

@bot.event
async def on_reaction_add(reaction, user):
    if user == bot.user:
        return

    # Check if the reaction is a red or blue emoji
    if str(reaction.emoji) == '🔴':
        # Record the user as picking option 1
        print(f'{user.name} picked option 1')
    elif str(reaction.emoji) == '🔵':
        # Record the user as picking option 2
        print(f'{user.name} picked option 2')

    

bot.run(TOKEN)