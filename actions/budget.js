"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/dist/types/server";

export async function getCurrentBudget(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized User");
    }

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      throw new Error("User Not Found");
    }

    const budget =await db.budget.findFirst({
      where:{
        userId:user.id,
      }
    });
    const currentDate=new Date();
    const startOfMonth=new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const endOfMonth=new Date(
      currentDate.getFullYear(),
      currentDate.getMonth()+1,
      0,
    );

    const expenses = await db.transaction.aggregate({
      where:{
        userId:user.id,
        type:"EXPENSE",
        date:{
          gte:startOfMonth,
          lte:endOfMonth,
        },
        accountId,
      },

      _sum:{
        amount:true,
      }
    });

    return {
      budget:budget?{...budget, amount:budget.amount.toNumber()}:null,
      currentExpenses:expenses._sum.amount?expenses._sum.amount.toNumber():0,
    }

  } catch (error) {
    console.log("Budget Fetching Error", error);
    throw error
  }
}

 
