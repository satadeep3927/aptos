import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Geist } from "next/font/google";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, CalendarDays, Target, Brain, Sparkles } from "lucide-react";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const onboardingSchema = z.object({
  testType: z.enum(["ccat", "wonderlic", "both"], {
    message: "Please select a test type",
  }),
  testDate: z.string().optional(),
  weakAreas: z.array(z.string()).min(1, "Select at least one area"),
  goal: z.string().optional(),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

const weakAreaOptions = [
  { id: "math", label: "Math & Numerical Reasoning", icon: "🔢" },
  { id: "logic", label: "Logic & Spatial Reasoning", icon: "🧩" },
  { id: "verbal", label: "Verbal Ability & Reading", icon: "📖" },
  { id: "speed", label: "Speed & Time Management", icon: "⏱️" },
  { id: "attention", label: "Attention to Detail", icon: "🔍" },
  { id: "pattern", label: "Pattern Recognition", icon: "🔗" },
];

const testDateOptions = [
  { value: "this_week", label: "This week" },
  { value: "next_week", label: "Next week" },
  { value: "this_month", label: "This month" },
  { value: "next_month", label: "Next month" },
  { value: "not_sure", label: "Not sure yet" },
];

export default function OnboardingPage() {
  const router = useRouter();

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      testType: undefined,
      testDate: undefined,
      weakAreas: [],
      goal: "",
    },
  });

  const submitOnboarding = trpc.user.submitOnboarding.useMutation({
    onSuccess() {
      router.push("/");
    },
  });

  function onSubmit(values: OnboardingValues) {
    submitOnboarding.mutate(values);
  }

  return (
    <>
      <Head>
        <title>Get Started — Aptos</title>
        <meta
          name="description"
          content="Set up your personalized CCAT & Wonderlic prep plan."
        />
      </Head>

      <div
        className={`${geistSans.className} min-h-screen bg-[#0a0a0a] text-white`}
      >
        {/* Minimal header */}
        <header className="border-b border-neutral-800/60 bg-[#0a0a0a]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-3xl items-center px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/assets/images/logo.png"
                alt="Aptos logo"
                width={32}
                height={32}
                className="rounded-sm invert"
              />
              <span className="text-lg font-bold tracking-tight text-white">
                Aptos
              </span>
            </Link>
          </div>
        </header>

        {/* Main content */}
        <main className="mx-auto max-w-2xl px-6 py-16">
          {/* Header section */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl border border-[#E4FF30]/20 bg-[#E4FF30]/10">
              <Sparkles className="size-6 text-[#E4FF30]" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Let&apos;s personalize your prep
            </h1>
            <p className="mt-3 text-neutral-400">
              Tell us about your goals so we can create a tailored study plan.
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-10"
            >
              {/* Test Type */}
              <FormField
                control={form.control}
                name="testType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-base text-white">
                      <Target className="size-4 text-[#E4FF30]" />
                      Which test are you preparing for?
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-neutral-700 bg-neutral-900 text-white hover:border-[#E4FF30]/40 focus:border-[#E4FF30] focus:ring-[#E4FF30]/20">
                          <SelectValue placeholder="Select a test" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-neutral-700 bg-neutral-900">
                        <SelectItem value="ccat" className="text-white focus:bg-[#E4FF30]/10 focus:text-[#E4FF30]">
                          CCAT (Criteria Cognitive Aptitude Test)
                        </SelectItem>
                        <SelectItem value="wonderlic" className="text-white focus:bg-[#E4FF30]/10 focus:text-[#E4FF30]">
                          Wonderlic
                        </SelectItem>
                        <SelectItem value="both" className="text-white focus:bg-[#E4FF30]/10 focus:text-[#E4FF30]">
                          Both CCAT & Wonderlic
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Test Date */}
              <FormField
                control={form.control}
                name="testDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-base text-white">
                      <CalendarDays className="size-4 text-[#E4FF30]" />
                      When is your test?
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-neutral-700 bg-neutral-900 text-white hover:border-[#E4FF30]/40 focus:border-[#E4FF30] focus:ring-[#E4FF30]/20">
                          <SelectValue placeholder="Select a timeframe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-neutral-700 bg-neutral-900">
                        {testDateOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="text-white focus:bg-[#E4FF30]/10 focus:text-[#E4FF30]"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-neutral-500">
                      This helps us prioritize your study plan.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Weak Areas */}
              <FormField
                control={form.control}
                name="weakAreas"
                render={() => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-base text-white">
                      <Brain className="size-4 text-[#E4FF30]" />
                      Which areas do you want to improve?
                    </FormLabel>
                    <FormDescription className="text-neutral-500">
                      Select all that apply. We&apos;ll focus your practice here.
                    </FormDescription>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {weakAreaOptions.map((area) => (
                        <FormField
                          key={area.id}
                          control={form.control}
                          name="weakAreas"
                          render={({ field }) => (
                            <FormItem key={area.id}>
                              <label
                                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${
                                  field.value?.includes(area.id)
                                    ? "border-[#E4FF30]/50 bg-[#E4FF30]/5"
                                    : "border-neutral-700 bg-neutral-900 hover:border-neutral-600"
                                }`}
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(area.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            area.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (v: string) => v !== area.id
                                            )
                                          );
                                    }}
                                    className="border-neutral-600 data-[state=checked]:border-[#E4FF30] data-[state=checked]:bg-[#E4FF30] data-[state=checked]:text-neutral-900"
                                  />
                                </FormControl>
                                <span className="text-lg">{area.icon}</span>
                                <span className="text-sm font-medium text-neutral-200">
                                  {area.label}
                                </span>
                              </label>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Goal */}
              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-white">
                      What&apos;s your goal? (optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. Score in the top 20% on my CCAT next month..."
                        className="min-h-25 resize-none border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-600 hover:border-[#E4FF30]/40 focus:border-[#E4FF30] focus:ring-[#E4FF30]/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2 bg-[#E4FF30] text-base font-semibold text-neutral-900 hover:bg-[#d4ef20]"
                disabled={submitOnboarding.isPending}
              >
                {submitOnboarding.isPending ? (
                  "Saving..."
                ) : (
                  <>
                    Start Practicing <ArrowRight className="size-4" />
                  </>
                )}
              </Button>

              {submitOnboarding.isError && (
                <p className="text-center text-sm text-red-400">
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          </Form>
        </main>
      </div>
    </>
  );
}
