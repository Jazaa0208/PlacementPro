from flask import Blueprint, jsonify, request
from flask_cors import CORS
import subprocess
import tempfile
import os
import sys
import json
import time
import psutil
from datetime import datetime
import random
import re

coding_bp = Blueprint('coding', __name__)
CORS(coding_bp)

# ====================================================================
# ENHANCED DATABASE WITH 15 PROBLEMS
# ====================================================================

PROBLEMS_DB = [
    {
        "id": 1,
        "title": "Two Sum",
        "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
        "examples": [
            {
                "input": "nums = [2,7,11,15], target = 9",
                "output": "[0,1]",
                "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
            }
        ],
        "constraints": [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Only one valid answer exists."
        ],
        "difficulty": "Easy",
        "acceptance": "45.6%",
        "submissions": "2.4M",
        "topics": ["Array", "Hash Table"],
        "companies": ["Google", "Amazon", "Facebook", "Microsoft", "Apple"],
        "frequency": "Very High",
        "timeComplexity": "O(n)",
        "spaceComplexity": "O(n)",
        "solutionApproach": "Use a hash map to store numbers and their indices. For each number, check if its complement exists in the map.",
        "hints": [
            "💡 Hint 1: Try using a hash map to store numbers and their indices",
            "💡 Hint 2: For each number, calculate the complement (target - current number)",
            "💡 Hint 3: Check if the complement exists in the hash map",
            "💡 Hint 4: Return indices when complement is found, else add current number to map"
        ],
        "test_cases": [
            {"input": "[2,7,11,15]\n9", "expected": "[0,1]", "isPublic": True},
            {"input": "[3,2,4]\n6", "expected": "[1,2]", "isPublic": True},
            {"input": "[3,3]\n6", "expected": "[0,1]", "isPublic": False},
            {"input": "[1,2,3,4,5]\n10", "expected": "[3,4]", "isPublic": False}
        ]
    },
    {
        "id": 2,
        "title": "Reverse String",
        "description": "Write a function that reverses a string. The input string is given as an array of characters s.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.",
        "examples": [
            {
                "input": 's = ["h","e","l","l","o"]',
                "output": '["o","l","l","e","h"]'
            }
        ],
        "constraints": [
            "1 <= s.length <= 10^5",
            "s[i] is a printable ascii character."
        ],
        "difficulty": "Easy",
        "acceptance": "72.3%",
        "submissions": "1.8M",
        "topics": ["Two Pointers", "String"],
        "companies": ["Apple", "Adobe", "Bloomberg"],
        "frequency": "High",
        "timeComplexity": "O(n)",
        "spaceComplexity": "O(1)",
        "solutionApproach": "Use two pointers starting from both ends, swap characters until they meet in the middle.",
        "hints": [
            "💡 Hint 1: Use two pointers - one at start and one at end",
            "💡 Hint 2: Swap characters at both pointers",
            "💡 Hint 3: Move pointers towards each other",
            "💡 Hint 4: Stop when pointers meet or cross"
        ],
        "test_cases": [
            {"input": '["h","e","l","l","o"]', "expected": '["o","l","l","e","h"]', "isPublic": True},
            {"input": '["H","a","n","n","a","h"]', "expected": '["h","a","n","n","a","H"]', "isPublic": True},
            {"input": '["A","B","C","D"]', "expected": '["D","C","B","A"]', "isPublic": False}
        ]
    },
    {
        "id": 3,
        "title": "Longest Substring Without Repeating Characters",
        "description": "Given a string s, find the length of the longest substring without repeating characters.",
        "examples": [
            {
                "input": 's = "abcabcbb"',
                "output": "3",
                "explanation": "The answer is 'abc', with the length of 3."
            }
        ],
        "constraints": [
            "0 <= s.length <= 5 * 10^4",
            "s consists of English letters, digits, symbols and spaces."
        ],
        "difficulty": "Medium",
        "acceptance": "31.8%",
        "submissions": "1.2M",
        "topics": ["Hash Table", "String", "Sliding Window"],
        "companies": ["Amazon", "Google", "Microsoft", "Facebook"],
        "frequency": "High",
        "timeComplexity": "O(n)",
        "spaceComplexity": "O(min(m, n))",
        "solutionApproach": "Use sliding window with hash set to track characters in current window.",
        "hints": [
            "💡 Hint 1: Use a sliding window approach",
            "💡 Hint 2: Maintain a set of characters in current window",
            "💡 Hint 3: Move left pointer when duplicate found"
        ],
        "test_cases": [
            {"input": '"abcabcbb"', "expected": "3", "isPublic": True},
            {"input": '"bbbbb"', "expected": "1", "isPublic": True},
            {"input": '"pwwkew"', "expected": "3", "isPublic": False}
        ]
    },
    {
        "id": 4,
        "title": "Median of Two Sorted Arrays",
        "description": "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
        "examples": [
            {
                "input": "nums1 = [1,3], nums2 = [2]",
                "output": "2.00000",
                "explanation": "Merged array = [1,2,3] and median is 2."
            }
        ],
        "constraints": [
            "nums1.length == m",
            "nums2.length == n",
            "0 <= m <= 1000",
            "0 <= n <= 1000",
            "1 <= m + n <= 2000"
        ],
        "difficulty": "Hard",
        "acceptance": "28.5%",
        "submissions": "800K",
        "topics": ["Array", "Binary Search", "Divide and Conquer"],
        "companies": ["Google", "Amazon", "Microsoft", "Facebook"],
        "frequency": "Medium",
        "timeComplexity": "O(log(min(m, n)))",
        "spaceComplexity": "O(1)",
        "solutionApproach": "Use binary search on the smaller array to find the correct partition.",
        "hints": [
            "💡 Hint 1: The problem can be converted to find the k-th element",
            "💡 Hint 2: Use binary search on the smaller array",
            "💡 Hint 3: Ensure the partition is valid"
        ],
        "test_cases": [
            {"input": "[1,3]\n[2]", "expected": "2.0", "isPublic": True},
            {"input": "[1,2]\n[3,4]", "expected": "2.5", "isPublic": True},
            {"input": "[0,0]\n[0,0]", "expected": "0.0", "isPublic": False}
        ]
    },
    {
        "id": 5,
        "title": "Palindrome Number",
        "description": "Given an integer x, return true if x is a palindrome, and false otherwise.",
        "examples": [
            {
                "input": "x = 121",
                "output": "true",
                "explanation": "121 reads as 121 from left to right and from right to left."
            }
        ],
        "constraints": [
            "-2^31 <= x <= 2^31 - 1"
        ],
        "difficulty": "Easy",
        "acceptance": "52.3%",
        "submissions": "1.5M",
        "topics": ["Math"],
        "companies": ["Google", "Amazon", "Microsoft"],
        "frequency": "High",
        "timeComplexity": "O(n)",
        "spaceComplexity": "O(1)",
        "solutionApproach": "Reverse the number and compare with original.",
        "hints": [
            "💡 Hint 1: Convert integer to string and check palindrome",
            "💡 Hint 2: Reverse the number mathematically without string conversion"
        ],
        "test_cases": [
            {"input": "121", "expected": "true", "isPublic": True},
            {"input": "-121", "expected": "false", "isPublic": True},
            {"input": "10", "expected": "false", "isPublic": False}
        ]
    },
    {
        "id": 6,
        "title": "Valid Parentheses",
        "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        "examples": [
            {
                "input": 's = "()"',
                "output": "true"
            }
        ],
        "constraints": [
            "1 <= s.length <= 10^4",
            "s consists of parentheses only '()[]{}'."
        ],
        "difficulty": "Easy",
        "acceptance": "40.1%",
        "submissions": "2.1M",
        "topics": ["String", "Stack"],
        "companies": ["Amazon", "Facebook", "Microsoft", "Apple"],
        "frequency": "Very High",
        "timeComplexity": "O(n)",
        "spaceComplexity": "O(n)",
        "solutionApproach": "Use stack to track opening brackets.",
        "hints": [
            "💡 Hint 1: Use a stack data structure",
            "💡 Hint 2: Push opening brackets, pop when matching closing bracket found"
        ],
        "test_cases": [
            {"input": '"()"', "expected": "true", "isPublic": True},
            {"input": '"()[]{}"', "expected": "true", "isPublic": True},
            {"input": '"(]"', "expected": "false", "isPublic": False}
        ]
    },
    {
        "id": 7,
        "title": "Merge Two Sorted Lists",
        "description": "Merge two sorted linked lists and return it as a sorted list.",
        "examples": [
            {
                "input": "l1 = [1,2,4], l2 = [1,3,4]",
                "output": "[1,1,2,3,4,4]"
            }
        ],
        "constraints": [
            "The number of nodes in both lists is in the range [0, 50]",
            "-100 <= Node.val <= 100",
            "Both l1 and l2 are sorted in non-decreasing order"
        ],
        "difficulty": "Easy",
        "acceptance": "58.9%",
        "submissions": "1.3M",
        "topics": ["Linked List", "Recursion"],
        "companies": ["Amazon", "Microsoft", "Apple"],
        "frequency": "High",
        "timeComplexity": "O(n+m)",
        "spaceComplexity": "O(1)",
        "solutionApproach": "Use two pointers to merge lists.",
        "hints": [
            "💡 Hint 1: Use dummy node to simplify merging",
            "💡 Hint 2: Compare nodes from both lists and attach smaller one"
        ],
        "test_cases": [
            {"input": "[1,2,4]\n[1,3,4]", "expected": "[1,1,2,3,4,4]", "isPublic": True},
            {"input": "[]\n[]", "expected": "[]", "isPublic": True},
            {"input": "[]\n[0]", "expected": "[0]", "isPublic": False}
        ]
    },
    {
        "id": 8,
        "title": "Maximum Subarray",
        "description": "Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.",
        "examples": [
            {
                "input": "nums = [-2,1,-3,4,-1,2,1,-5,4]",
                "output": "6",
                "explanation": "[4,-1,2,1] has the largest sum = 6."
            }
        ],
        "constraints": [
            "1 <= nums.length <= 10^5",
            "-10^4 <= nums[i] <= 10^4"
        ],
        "difficulty": "Medium",
        "acceptance": "49.2%",
        "submissions": "1.8M",
        "topics": ["Array", "Divide and Conquer", "Dynamic Programming"],
        "companies": ["Amazon", "Google", "Microsoft", "Facebook"],
        "frequency": "Very High",
        "timeComplexity": "O(n)",
        "spaceComplexity": "O(1)",
        "solutionApproach": "Use Kadane's algorithm to find maximum subarray sum.",
        "hints": [
            "💡 Hint 1: Use dynamic programming approach",
            "💡 Hint 2: Track current sum and maximum sum"
        ],
        "test_cases": [
            {"input": "[-2,1,-3,4,-1,2,1,-5,4]", "expected": "6", "isPublic": True},
            {"input": "[1]", "expected": "1", "isPublic": True},
            {"input": "[5,4,-1,7,8]", "expected": "23", "isPublic": False}
        ]
    },
    {
        "id": 9,
        "title": "Container With Most Water",
        "description": "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
        "examples": [
            {
                "input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
                "output": "6"
            }
        ],
        "constraints": [
            "n == height.length",
            "1 <= n <= 2 * 10^4",
            "0 <= height[i] <= 10^5"
        ],
        "difficulty": "Medium",
        "acceptance": "54.3%",
        "submissions": "900K",
        "topics": ["Array", "Two Pointers", "Dynamic Programming"],
        "companies": ["Google", "Amazon", "Microsoft"],
        "frequency": "High",
        "timeComplexity": "O(n)",
        "spaceComplexity": "O(1)",
        "solutionApproach": "Use two pointers from both ends.",
        "hints": [
            "💡 Hint 1: Use two pointers approach",
            "💡 Hint 2: Calculate area and move pointer with smaller height"
        ],
        "test_cases": [
            {"input": "[1,8,6,2,5,4,8,3,7]", "expected": "49", "isPublic": True},
            {"input": "[1,1]", "expected": "1", "isPublic": True},
            {"input": "[4,3,2,1,4]", "expected": "16", "isPublic": False}
        ]
    },
    {
        "id": 10,
        "title": "3Sum",
        "description": "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j != k and nums[i] + nums[j] + nums[k] == 0.",
        "examples": [
            {
                "input": "nums = [-1,0,1,2,-1,-4]",
                "output": "[[-1,-1,2],[-1,0,1]]"
            }
        ],
        "constraints": [
            "0 <= nums.length <= 3000",
            "-10^5 <= nums[i] <= 10^5"
        ],
        "difficulty": "Medium",
        "acceptance": "30.5%",
        "submissions": "1.1M",
        "topics": ["Array", "Two Pointers", "Sorting"],
        "companies": ["Amazon", "Facebook", "Microsoft"],
        "frequency": "High",
        "timeComplexity": "O(n^2)",
        "spaceComplexity": "O(1)",
        "solutionApproach": "Sort array and use two pointers for each element.",
        "hints": [
            "💡 Hint 1: Sort the array first",
            "💡 Hint 2: For each element, use two pointers to find pairs that sum to -element"
        ],
        "test_cases": [
            {"input": "[-1,0,1,2,-1,-4]", "expected": "[[-1,-1,2],[-1,0,1]]", "isPublic": True},
            {"input": "[0,1,1]", "expected": "[]", "isPublic": True},
            {"input": "[0,0,0]", "expected": "[[0,0,0]]", "isPublic": False}
        ]
    },
    {
        "id": 11,
        "title": "Letter Combinations of a Phone Number",
        "description": "Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent.",
        "examples": [
            {
                "input": 'digits = "23"',
                "output": '["ad","ae","af","bd","be","bf","cd","ce","cf"]'
            }
        ],
        "constraints": [
            "0 <= digits.length <= 4",
            "digits[i] is a digit in the range ['2', '9']."
        ],
        "difficulty": "Medium",
        "acceptance": "53.2%",
        "submissions": "800K",
        "topics": ["Hash Table", "String", "Backtracking"],
        "companies": ["Amazon", "Google", "Uber"],
        "frequency": "Medium",
        "timeComplexity": "O(4^n)",
        "spaceComplexity": "O(n)",
        "solutionApproach": "Use backtracking to generate all combinations.",
        "hints": [
            "💡 Hint 1: Use depth-first search",
            "💡 Hint 2: Map digits to corresponding letters"
        ],
        "test_cases": [
            {"input": '"23"', "expected": '["ad","ae","af","bd","be","bf","cd","ce","cf"]', "isPublic": True},
            {"input": '""', "expected": "[]", "isPublic": True},
            {"input": '"2"', "expected": '["a","b","c"]', "isPublic": False}
        ]
    },
    {
        "id": 12,
        "title": "Generate Parentheses",
        "description": "Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.",
        "examples": [
            {
                "input": "n = 3",
                "output": '["((()))","(()())","(())()","()(())","()()()"]'
            }
        ],
        "constraints": [
            "1 <= n <= 8"
        ],
        "difficulty": "Medium",
        "acceptance": "70.5%",
        "submissions": "700K",
        "topics": ["String", "Backtracking"],
        "companies": ["Google", "Microsoft", "Facebook"],
        "frequency": "High",
        "timeComplexity": "O(4^n/√n)",
        "spaceComplexity": "O(n)",
        "solutionApproach": "Use backtracking with open and close counts.",
        "hints": [
            "💡 Hint 1: Use recursive backtracking",
            "💡 Hint 2: Track number of open and close parentheses"
        ],
        "test_cases": [
            {"input": "3", "expected": '["((()))","(()())","(())()","()(())","()()()"]', "isPublic": True},
            {"input": "1", "expected": '["()"]', "isPublic": True},
            {"input": "2", "expected": '["(())","()()"]', "isPublic": False}
        ]
    },
    {
        "id": 13,
        "title": "Merge k Sorted Lists",
        "description": "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
        "examples": [
            {
                "input": "lists = [[1,4,5],[1,3,4],[2,6]]",
                "output": "[1,1,2,3,4,4,5,6]"
            }
        ],
        "constraints": [
            "k == lists.length",
            "0 <= k <= 10^4",
            "0 <= lists[i].length <= 500",
            "-10^4 <= lists[i][j] <= 10^4"
        ],
        "difficulty": "Hard",
        "acceptance": "47.3%",
        "submissions": "600K",
        "topics": ["Linked List", "Divide and Conquer", "Heap"],
        "companies": ["Amazon", "Google", "Microsoft"],
        "frequency": "High",
        "timeComplexity": "O(n log k)",
        "spaceComplexity": "O(1)",
        "solutionApproach": "Use min-heap to merge lists efficiently.",
        "hints": [
            "💡 Hint 1: Use priority queue (min-heap)",
            "💡 Hint 2: Push first node of each list into heap"
        ],
        "test_cases": [
            {"input": "[[1,4,5],[1,3,4],[2,6]]", "expected": "[1,1,2,3,4,4,5,6]", "isPublic": True},
            {"input": "[]", "expected": "[]", "isPublic": True},
            {"input": "[[]]", "expected": "[]", "isPublic": False}
        ]
    },
    {
        "id": 14,
        "title": "First Missing Positive",
        "description": "Given an unsorted integer array nums, return the smallest missing positive integer.",
        "examples": [
            {
                "input": "nums = [1,2,0]",
                "output": "3"
            }
        ],
        "constraints": [
            "1 <= nums.length <= 5 * 10^5",
            "-2^31 <= nums[i] <= 2^31 - 1"
        ],
        "difficulty": "Hard",
        "acceptance": "37.2%",
        "submissions": "500K",
        "topics": ["Array", "Hash Table"],
        "companies": ["Amazon", "Microsoft", "Google"],
        "frequency": "Medium",
        "timeComplexity": "O(n)",
        "spaceComplexity": "O(1)",
        "solutionApproach": "Use array indices as hash keys.",
        "hints": [
            "💡 Hint 1: Think about how you would solve it in O(n) time and O(1) space",
            "💡 Hint 2: Use the array itself as a hash table"
        ],
        "test_cases": [
            {"input": "[1,2,0]", "expected": "3", "isPublic": True},
            {"input": "[3,4,-1,1]", "expected": "2", "isPublic": True},
            {"input": "[7,8,9,11,12]", "expected": "1", "isPublic": False}
        ]
    },
    {
        "id": 15,
        "title": "Trapping Rain Water",
        "description": "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
        "examples": [
            {
                "input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
                "output": "6"
            }
        ],
        "constraints": [
            "n == height.length",
            "1 <= n <= 2 * 10^4",
            "0 <= height[i] <= 10^5"
        ],
        "difficulty": "Hard",
        "acceptance": "58.9%",
        "submissions": "700K",
        "topics": ["Array", "Two Pointers", "Dynamic Programming"],
        "companies": ["Google", "Amazon", "Microsoft"],
        "frequency": "High",
        "timeComplexity": "O(n)",
        "spaceComplexity": "O(1)",
        "solutionApproach": "Use two pointers to calculate trapped water.",
        "hints": [
            "💡 Hint 1: Use two pointers from both ends",
            "💡 Hint 2: Track left and right maximums"
        ],
        "test_cases": [
            {"input": "[0,1,0,2,1,0,1,3,2,1,2,1]", "expected": "6", "isPublic": True},
            {"input": "[4,2,0,3,2,5]", "expected": "9", "isPublic": True},
            {"input": "[4,2,3]", "expected": "1", "isPublic": False}
        ]
    }
]

# Satara College Companies Data
SATARA_COMPANIES = {
    "TCS": {
        "name": "Tata Consultancy Services",
        "problems": ["Two Sum", "Reverse String", "Palindrome Number", "Valid Parentheses"],
        "package": "3.5-7 LPA",
        "visit_frequency": "Every Semester",
        "requirements": ["60% throughout academics", "Good programming skills", "Communication skills"]
    },
    "Infosys": {
        "name": "Infosys Limited",
        "problems": ["Two Sum", "Merge Two Sorted Lists", "Maximum Subarray", "Valid Parentheses"],
        "package": "3.5-6 LPA",
        "visit_frequency": "Twice a Year",
        "requirements": ["65% in graduation", "Basic programming knowledge", "Logical thinking"]
    },
    "Wipro": {
        "name": "Wipro Technologies",
        "problems": ["Reverse String", "Palindrome Number", "Two Sum", "Merge Two Sorted Lists"],
        "package": "3.5-5.5 LPA",
        "visit_frequency": "Every Semester",
        "requirements": ["60% aggregate", "Good coding skills", "Teamwork"]
    },
    "Capgemini": {
        "name": "Capgemini India",
        "problems": ["Two Sum", "Valid Parentheses", "Reverse String", "Maximum Subarray"],
        "package": "4-6.5 LPA",
        "visit_frequency": "Annual",
        "requirements": ["60% throughout", "Analytical skills", "Communication skills"]
    },
    "Accenture": {
        "name": "Accenture Solutions",
        "problems": ["Palindrome Number", "Two Sum", "Valid Parentheses", "Merge Two Sorted Lists"],
        "package": "4.5-7 LPA",
        "visit_frequency": "Twice a Year",
        "requirements": ["65% aggregate", "Problem solving", "Adaptability"]
    },
    "Cognizant": {
        "name": "Cognizant Technology Solutions",
        "problems": ["Two Sum", "Reverse String", "Valid Parentheses", "Maximum Subarray"],
        "package": "4-6 LPA",
        "visit_frequency": "Every Semester",
        "requirements": ["60% in graduation", "Coding skills", "Learning ability"]
    },
    "Tech Mahindra": {
        "name": "Tech Mahindra Ltd",
        "problems": ["Palindrome Number", "Two Sum", "Reverse String", "Merge Two Sorted Lists"],
        "package": "3.5-5 LPA",
        "visit_frequency": "Annual",
        "requirements": ["55% aggregate", "Basic programming", "Communication"]
    },
    "IBM": {
        "name": "IBM India",
        "problems": ["Two Sum", "Longest Substring", "Valid Parentheses", "Maximum Subarray"],
        "package": "5-8 LPA",
        "visit_frequency": "Annual",
        "requirements": ["65% throughout", "Strong coding", "Innovation mindset"]
    }
}

# Enhanced user progress tracking
user_progress = {
    "problems_solved": 0,
    "total_problems": len(PROBLEMS_DB),  # This will be 15
    "accuracy": 0,
    "global_rank": 0,
    "companies_target": len(SATARA_COMPANIES),
    "total_companies": len(SATARA_COMPANIES),  # This will be 8
    "current_streak": 0,
    "easy_solved": 0,
    "medium_solved": 0,
    "hard_solved": 0,
    "submissions": []
}

# Enhanced language templates with basic starter code
LANGUAGE_TEMPLATES = {
    "javascript": {
        "extension": "js",
        "template": {
            # Basic starter template - students write their own code
            1: "// Write your solution for Two Sum here\nfunction twoSum(nums, target) {\n    // Your code here\n    \n}",
            2: "// Write your solution for Reverse String here\nfunction reverseString(s) {\n    // Your code here\n    \n}"
        },
        "run_command": ["node", "{filepath}"]
    },
    "python": {
        "extension": "py",
        "template": {
            1: "# Write your solution for Two Sum here\ndef two_sum(nums, target):\n    # Your code here\n    pass",
            2: "# Write your solution for Reverse String here\ndef reverse_string(s):\n    # Your code here\n    pass"
        },
        "run_command": ["python", "{filepath}"]
    },
    "java": {
        "extension": "java",
        "template": {
            1: "// Write your solution for Two Sum here\npublic class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n        return new int[0];\n    }\n}",
            2: "// Write your solution for Reverse String here\npublic class Solution {\n    public void reverseString(char[] s) {\n        // Your code here\n    }\n}"
        },
        "run_command": ["javac", "{filepath}", "&&", "java", "-cp", "{filedir}", "Solution"]
    },
    "cpp": {
        "extension": "cpp",
        "template": {
            1: "// Write your solution for Two Sum here\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n        return {};\n    }\n};",
            2: "// Write your solution for Reverse String here\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        // Your code here\n    }\n};"
        },
        "run_command": ["g++", "{filepath}", "-o", "{filepath}.out", "&&", "{filepath}.out"]
    },
    "c": {
        "extension": "c",
        "template": {
            1: "// Write your solution for Two Sum here\n#include <stdlib.h>\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // Your code here\n    *returnSize = 0;\n    return NULL;\n}",
            2: "// Write your solution for Reverse String here\nvoid reverseString(char* s, int sSize) {\n    // Your code here\n}"
        },
        "run_command": ["gcc", "{filepath}", "-o", "{filepath}.out", "&&", "{filepath}.out"]
    }
}

# ====================================================================
# ENHANCED UTILITY FUNCTIONS
# ====================================================================

def get_memory_usage():
    """Get memory usage in MB"""
    try:
        process = psutil.Process()
        return process.memory_info().rss / 1024 / 1024
    except:
        return 0

def create_temp_file(code, extension):
    """Create a temporary file with the given code"""
    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix=f'.{extension}', delete=False, encoding='utf-8') as f:
            f.write(code)
            return f.name
    except Exception as e:
        print(f"Error creating temp file: {e}")
        return None

def cleanup_temp_file(filepath):
    """Clean up temporary file"""
    try:
        if os.path.exists(filepath):
            os.unlink(filepath)
        # Also clean up compiled files
        if os.path.exists(filepath + '.out'):
            os.unlink(filepath + '.out')
        # Clean up .class files for Java
        if filepath.endswith('.java'):
            class_file = filepath.replace('.java', '.class')
            if os.path.exists(class_file):
                os.unlink(class_file)
    except Exception as e:
        print(f"Error cleaning up files: {e}")

def execute_code(filepath, language, input_data="", timeout=10):
    """Execute code with input data passed to stdin"""
    try:
        if language not in LANGUAGE_TEMPLATES:
            return {"error": f"Unsupported language: {language}"}
        
        command_template = LANGUAGE_TEMPLATES[language]["run_command"]
        filedir = os.path.dirname(filepath)
        
        command = []
        for cmd in command_template:
            cmd = cmd.replace("{filepath}", filepath)
            cmd = cmd.replace("{filedir}", filedir)
            command.append(cmd)
        
        start_time = time.time()
        start_memory = get_memory_usage()
        
        use_shell = any('&&' in cmd for cmd in command)
        
        if use_shell:
            full_command = ' '.join(command)
        else:
            full_command = command

        # Critical: Pass input_data to stdin
        result = subprocess.run(
            full_command,
            input=input_data,           # This feeds the test case input
            capture_output=True,
            text=True,
            timeout=timeout,
            shell=use_shell
        )
        
        end_time = time.time()
        end_memory = get_memory_usage()
        
        execution_time = round((end_time - start_time) * 1000, 2)
        memory_used = round(abs(end_memory - start_memory), 2)
        
        return {
            "stdout": result.stdout.strip(),
            "stderr": result.stderr,
            "returncode": result.returncode,
            "execution_time": execution_time,
            "memory_used": memory_used,
            "success": result.returncode == 0
        }
        
    except subprocess.TimeoutExpired:
        return {"error": "Time Limit Exceeded", "success": False}
    except Exception as e:
        return {"error": f"Execution failed: {str(e)}", "success": False}
def normalize_output(output):
    """Normalize output for comparison - remove extra spaces, newlines, etc."""
    if output is None:
        return ""
    # Convert to string, remove extra whitespace, and standardize format
    output_str = str(output).strip()
    # Remove extra spaces between elements
    output_str = re.sub(r'\s+', ' ', output_str)
    # Standardize array formatting
    output_str = output_str.replace("'", '"')  # Standardize quotes
    return output_str

def validate_test_cases(problem_id, code_output, language):
    """Validate code output against test cases with improved matching."""
    problem = next((p for p in PROBLEMS_DB if p["id"] == problem_id), None)
    if not problem:
        return {"error": "Problem not found"}
    
    test_cases = problem["test_cases"]
    passed = 0
    results = []
    
    # Normalize the actual output
    normalized_actual = normalize_output(code_output)
    
    for i, test_case in enumerate(test_cases):
        expected = test_case["expected"]
        normalized_expected = normalize_output(expected)
        
        # Enhanced validation with multiple matching strategies
        is_passed = False
        
        # Strategy 1: Exact match (for simple outputs)
        if normalized_expected == normalized_actual:
            is_passed = True
        
        # Strategy 2: Contains match (for outputs with extra text)
        elif normalized_expected in normalized_actual:
            is_passed = True
        
        # Strategy 3: Array/list matching (for array outputs)
        elif "[" in normalized_expected and "]" in normalized_expected:
            # Extract array contents for comparison
            expected_array = re.findall(r'\[(.*?)\]', normalized_expected)
            actual_array = re.findall(r'\[(.*?)\]', normalized_actual)
            if expected_array and actual_array:
                # Compare array contents
                if normalize_output(expected_array[0]) == normalize_output(actual_array[0]):
                    is_passed = True
        
        # Strategy 4: Number matching (for numeric outputs)
        elif normalized_expected.replace('.', '').replace('-', '').isdigit():
            try:
                expected_num = float(normalized_expected)
                # Find numbers in actual output
                actual_numbers = re.findall(r'-?\d+\.?\d*', normalized_actual)
                for num_str in actual_numbers:
                    try:
                        if float(num_str) == expected_num:
                            is_passed = True
                            break
                    except ValueError:
                        continue
            except ValueError:
                pass
        
        # Strategy 5: Boolean matching
        elif normalized_expected.lower() in ['true', 'false']:
            actual_lower = normalized_actual.lower()
            if normalized_expected.lower() in actual_lower:
                is_passed = True
        
        if is_passed:
            passed += 1
        
        results.append({
            "test_case": i + 1,
            "input": test_case["input"],
            "expected": expected,
            "actual": normalized_actual[:100] + "..." if len(normalized_actual) > 100 else normalized_actual,
            "passed": is_passed,
            "isPublic": test_case.get("isPublic", True)
        })
    
    score = (passed / len(test_cases)) * 100 if test_cases else 0
    return {
        "score": round(score),
        "passed_tests": passed,
        "total_tests": len(test_cases),
        "results": results
    }

# ====================================================================
# ENHANCED ROUTES
# ====================================================================

@coding_bp.route('/problems', methods=['GET'])
def get_coding_problems():
    """Returns filtered and sorted coding problems."""
    try:
        difficulty = request.args.get('difficulty')
        topic = request.args.get('topic')
        search = request.args.get('search')
        sort_by = request.args.get('sort_by', 'id')
        
        filtered_problems = PROBLEMS_DB
        
        # Apply filters
        if difficulty and difficulty != 'All':
            filtered_problems = [p for p in filtered_problems if p["difficulty"] == difficulty]
        
        if topic and topic != 'All':
            filtered_problems = [p for p in filtered_problems if topic in p["topics"]]
        
        if search:
            filtered_problems = [p for p in filtered_problems if search.lower() in p["title"].lower()]
        
        # Apply sorting
        if sort_by == 'difficulty':
            difficulty_order = {'Easy': 1, 'Medium': 2, 'Hard': 3}
            filtered_problems.sort(key=lambda x: difficulty_order[x["difficulty"]])
        elif sort_by == 'acceptance':
            filtered_problems.sort(key=lambda x: float(x["acceptance"].strip('%')), reverse=True)
        else:  # default sort by id
            filtered_problems.sort(key=lambda x: x["id"])
        
        # Return simplified problem list
        simplified_problems = []
        for problem in filtered_problems:
            simplified_problems.append({
                "id": problem["id"],
                "title": problem["title"],
                "difficulty": problem["difficulty"],
                "acceptance": problem["acceptance"],
                "companies": problem["companies"][:3],  # Limit companies shown
                "topics": problem["topics"],
                "frequency": problem["frequency"]
            })
        
        return jsonify({
            "success": True,
            "problems": simplified_problems,
            "total": len(filtered_problems),
            "filters": {
                "difficulties": ["Easy", "Medium", "Hard"],
                "topics": list(set([topic for p in PROBLEMS_DB for topic in p["topics"]]))
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch problems: {str(e)}"
        }), 500

@coding_bp.route('/problems/<int:problem_id>', methods=['GET'])
def get_problem_detail(problem_id):
    """Returns detailed information about a specific problem."""
    try:
        problem = next((p for p in PROBLEMS_DB if p["id"] == problem_id), None)
        
        if not problem:
            return jsonify({
                "success": False,
                "error": "Problem not found"
            }), 404
        
        return jsonify({
            "success": True,
            "problem": problem
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch problem: {str(e)}"
        }), 500

@coding_bp.route('/run', methods=['POST'])
def run_code():
    try:
        data = request.get_json()
        code = data.get('code', '')
        language = data.get('language', 'python')
        problem_id = data.get('problem_id', 1)

        if not code or language not in LANGUAGE_TEMPLATES:
            return jsonify({"success": False, "error": "Invalid request"}), 400

        temp_file = create_temp_file(code, LANGUAGE_TEMPLATES[language]["extension"])
        if not temp_file:
            return jsonify({"success": False, "error": "Failed to create file"}), 500

        try:
            # Get one public test case for "Run"
            problem = next((p for p in PROBLEMS_DB if p["id"] == problem_id), None)
            if not problem:
                return jsonify({"success": False, "error": "Problem not found"}), 404

            public_case = next((t for t in problem["test_cases"] if t.get("isPublic")), problem["test_cases"][0])
            input_data = public_case["input"]

            result = execute_code(temp_file, language, input_data=input_data)

            if "error" in result:
                return jsonify({
                    "success": False,
                    "output": "Execution Failed",
                    "error": result["error"],
                    "console_output": result.get("stdout", "") + result.get("stderr", "")
                }), 200

            return jsonify({
                "success": True,
                "output": "Code executed successfully",
                "console_output": result["stdout"],
                "error": result["stderr"],
                "execution_time": result["execution_time"],
                "memory_used": result["memory_used"]
            }), 200

        finally:
            cleanup_temp_file(temp_file)

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@coding_bp.route('/submit', methods=['POST'])
def submit_code():
    try:
        data = request.get_json()
        code = data.get('code', '')
        language = data.get('language', 'python')
        problem_id = data.get('problem_id', 1)

        if not code or language not in LANGUAGE_TEMPLATES:
            return jsonify({"success": False, "error": "Invalid request"}), 400

        problem = next((p for p in PROBLEMS_DB if p["id"] == problem_id), None)
        if not problem:
            return jsonify({"success": False, "error": "Problem not found"}), 404

        temp_file = create_temp_file(code, LANGUAGE_TEMPLATES[language]["extension"])
        if not temp_file:
            return jsonify({"success": False, "error": "Failed to create file"}), 500

        try:
            all_results = []
            passed = 0

            for i, test_case in enumerate(problem["test_cases"]):
                input_data = test_case["input"]
                expected = test_case["expected"]

                result = execute_code(temp_file, language, input_data=input_data, timeout=5)

                if "error" in result:
                    all_results.append({"passed": False, "input": input_data, "expected": expected, "actual": result["error"]})
                    continue

                actual = result["stdout"]
                normalized_actual = normalize_output(actual)
                normalized_expected = normalize_output(expected)

                is_passed = normalized_actual == normalized_expected

                if not is_passed:
                    # Fallback: try flexible matching
                    if "[" in normalized_expected:
                        import json
                        try:
                            expected_list = json.loads(normalized_expected.replace("'", '"'))
                            actual_list = json.loads("[" + normalized_actual.replace("'", '"') + "]")
                            is_passed = sorted(expected_list) == sorted(actual_list) or expected_list == actual_list
                        except:
                            pass

                if is_passed:
                    passed += 1

                all_results.append({
                    "test_case": i+1,
                    "passed": is_passed,
                    "input": input_data,
                    "expected": expected,
                    "actual": actual or "(empty)",
                    "isPublic": test_case.get("isPublic", True)
                })

            score = round((passed / len(problem["test_cases"])) * 100)

            # Update progress
            if score == 100:
                diff = problem["difficulty"].lower()
                user_progress[f"{diff}_solved"] += 1
                user_progress["problems_solved"] += 1

            user_progress["submissions"].append({
                "id": len(user_progress["submissions"]) + 1,
                "date": datetime.now().isoformat(),
                "problem_id": problem_id,
                "problem_title": problem["title"],
                "language": language,
                "score": score,
                "status": "Accepted" if score == 100 else "Wrong Answer"
            })

            return jsonify({
                "success": True,
                "score": score,
                "passed_tests": passed,
                "total_tests": len(problem["test_cases"]),
                "test_results": all_results,
                "feedback": "Accepted! Well done!" if score == 100 else "Keep trying! Check failed cases."
            }), 200

        finally:
            cleanup_temp_file(temp_file)

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
@coding_bp.route('/progress', methods=['GET'])
def get_progress():
    """Returns enhanced user progress statistics."""
    try:
        # Calculate progress percentages
        total_easy = len([p for p in PROBLEMS_DB if p["difficulty"] == "Easy"])
        total_medium = len([p for p in PROBLEMS_DB if p["difficulty"] == "Medium"])
        total_hard = len([p for p in PROBLEMS_DB if p["difficulty"] == "Hard"])
        
        progress_data = {
            **user_progress,
            "easy_progress": round((user_progress["easy_solved"] / total_easy) * 100) if total_easy > 0 else 0,
            "medium_progress": round((user_progress["medium_solved"] / total_medium) * 100) if total_medium > 0 else 0,
            "hard_progress": round((user_progress["hard_solved"] / total_hard) * 100) if total_hard > 0 else 0,
            "total_easy": total_easy,
            "total_medium": total_medium,
            "total_hard": total_hard
        }
        
        return jsonify({
            "success": True,
            "progress": progress_data
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch progress: {str(e)}"
        }), 500

@coding_bp.route('/submissions', methods=['GET'])
def get_submissions():
    """Returns user's submission history with pagination."""
    try:
        problem_id = request.args.get('problem_id', type=int)
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        
        submissions = user_progress["submissions"]
        
        if problem_id:
            submissions = [s for s in submissions if s.get("problem_id") == problem_id]
        
        # Pagination
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_submissions = submissions[-end_idx:-start_idx] if start_idx > 0 else submissions[-limit:]
        
        # Format submissions
        formatted_submissions = []
        for sub in paginated_submissions[::-1]:  # Reverse to show latest first
            problem = next((p for p in PROBLEMS_DB if p["id"] == sub.get("problem_id", 1)), PROBLEMS_DB[0])
            formatted_submissions.append({
                "id": sub["id"],
                "date": sub["date"][:10],
                "problem": problem["title"],
                "language": sub.get("language", "python").capitalize(),
                "status": sub.get("status", "Pending"),
                "time": f"{sub.get('execution_time', 0)}ms",
                "memory": f"{sub.get('memory_used', 0)}MB",
                "score": sub.get("score", 0)
            })
        
        return jsonify({
            "success": True,
            "submissions": formatted_submissions,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": len(submissions)
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch submissions: {str(e)}"
        }), 500

@coding_bp.route('/template/<int:problem_id>/<language>', methods=['GET'])
def get_code_template(problem_id, language):
    """Returns basic starter code template for a problem in specified language."""
    try:
        if language not in LANGUAGE_TEMPLATES:
            return jsonify({
                "success": False,
                "error": f"Unsupported language: {language}"
            }), 400
        
        problem = next((p for p in PROBLEMS_DB if p["id"] == problem_id), None)
        if not problem:
            return jsonify({
                "success": False,
                "error": "Problem not found"
            }), 404
        
        # Return basic starter template instead of full solution
        template = LANGUAGE_TEMPLATES[language]["template"].get(
            problem_id, 
            f"// Write your solution for {problem['title']} in {language.capitalize()}\n// Implement your solution here"
        )
        
        return jsonify({
            "success": True,
            "template": template,
            "language": language,
            "problem_title": problem["title"]
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch template: {str(e)}"
        }), 500

@coding_bp.route('/hints/<int:problem_id>', methods=['GET'])
def get_hints(problem_id):
    """Returns hints for a specific problem."""
    try:
        problem = next((p for p in PROBLEMS_DB if p["id"] == problem_id), None)
        if not problem:
            return jsonify({
                "success": False,
                "error": "Problem not found"
            }), 404
        
        return jsonify({
            "success": True,
            "hints": problem.get("hints", [])
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch hints: {str(e)}"
        }), 500

@coding_bp.route('/companies', methods=['GET'])
def get_companies():
    """Returns list of companies that visit Satara College."""
    try:
        return jsonify({
            "success": True,
            "companies": SATARA_COMPANIES
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch companies: {str(e)}"
        }), 500

@coding_bp.route('/company/<company_name>', methods=['GET'])
def get_company_details(company_name):
    """Returns detailed information about a specific company."""
    try:
        company = SATARA_COMPANIES.get(company_name.upper())
        if not company:
            return jsonify({
                "success": False,
                "error": "Company not found"
            }), 404
        
        # Get problems asked by this company
        company_problems = []
        for problem_name in company["problems"]:
            problem = next((p for p in PROBLEMS_DB if p["title"] == problem_name), None)
            if problem:
                company_problems.append({
                    "id": problem["id"],
                    "title": problem["title"],
                    "difficulty": problem["difficulty"],
                    "acceptance": problem["acceptance"]
                })
        
        return jsonify({
            "success": True,
            "company": {
                **company,
                "problems": company_problems
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch company details: {str(e)}"
        }), 500

@coding_bp.route('/statistics', methods=['GET'])
def get_statistics():
    """Returns coding statistics and analytics."""
    try:
        total_problems = len(PROBLEMS_DB)
        easy_problems = len([p for p in PROBLEMS_DB if p["difficulty"] == "Easy"])
        medium_problems = len([p for p in PROBLEMS_DB if p["difficulty"] == "Medium"])
        hard_problems = len([p for p in PROBLEMS_DB if p["difficulty"] == "Hard"])
        
        # Calculate topic distribution
        topics = {}
        for problem in PROBLEMS_DB:
            for topic in problem["topics"]:
                topics[topic] = topics.get(topic, 0) + 1
        
        # Calculate company frequency
        companies = {}
        for problem in PROBLEMS_DB:
            for company in problem["companies"]:
                companies[company] = companies.get(company, 0) + 1
        
        return jsonify({
            "success": True,
            "statistics": {
                "total_problems": total_problems,
                "easy_problems": easy_problems,
                "medium_problems": medium_problems,
                "hard_problems": hard_problems,
                "topic_distribution": topics,
                "company_frequency": companies
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch statistics: {str(e)}"
        }), 500

# Health check endpoint
@coding_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "success": True,
        "message": "Coding module is working!",
        "timestamp": datetime.now().isoformat(),
        "problems_count": len(PROBLEMS_DB),
        "supported_languages": list(LANGUAGE_TEMPLATES.keys())
    }), 200

# Error handlers
@coding_bp.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Endpoint not found"
    }), 404

@coding_bp.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500