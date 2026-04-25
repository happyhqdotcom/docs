---
hidden: true
title: Streams
description: A Stream is a type of work in HappyHQ, like SOWs, weekly updates, or user stories. It holds the playbook, specs, and samples that define how that work gets done.
nextjs:
  metadata:
    title: Streams — a type of work in HappyHQ
---

A Stream is a type of work. We like to think of them as work streams. A Stream holds all the details that someone would need to do this particular type of work. What steps are involved, all the nitty gritty decisions you make, and past examples that reflect what you want this work to look like. We hand this work to Q, but you could just as easily onboard a human teammate with the same material.

---

## When to create a Stream

Look at your to-do list. If you group items by the type of work they represent, you'll start to see patterns. You write a weekly update every Monday. You draft a client report after every engagement. You prep for 1:1s before each meeting.

Each of those patterns is a candidate for a Stream.

A good rule of thumb: if you've done this kind of work before and you'll do it again, it's worth creating a Stream. You don't need to get it perfect up front. Streams are designed to get better over time as you use them.

Some examples:

- **SOWs.** Your company writes them regularly, each following a similar structure with section-specific rules.
- **Weekly client updates.** Same format, different data each week.
- **User stories.** Your BAs write dozens, all following the same acceptance criteria pattern.
- **Performance reviews.** Same template, same evaluation criteria, different people.
- **Blog posts.** Consistent voice, consistent structure, different topics.

---

## What's inside a Stream

A Stream contains three things: a playbook, specs, and samples. Together, they capture how you do this type of work.

### Playbook

The playbook describes how the work gets done, step by step. Imagine sitting down with someone and walking them through your process at a simple level. That's the playbook.

A playbook for SOWs might look like:

1. Review the pitch deck and any notes from the client.
2. Determine which sections and deliverables apply to this deal.
3. Draft each section, checking samples for how similar deals were handled.
4. Compile and run the quality checklist.

It doesn't need to be long. It needs to be clear enough that someone unfamiliar with the work could follow it.

### Specs

Specs capture the details that make the work yours. Your terminology, your preferences, your standards. The kind of knowledge that usually lives in someone's head but never gets written down.

For an SOW Stream, specs might cover your pricing model, your standard scope exclusions, or the decision matrix for invoice schedules. For a blog post Stream, specs might define your voice guidelines, word count targets, or SEO rules.

### Samples

Samples are examples of the finished product. If you're teaching someone to write SOWs, you'd show them past SOWs. Same idea. Samples show what good looks like.

A typical Stream directory looks like this:

{% files %}
{% folder name="sow" %}
  {% file name="playbook.md" /%}
  {% folder name="specs" %}
    {% file name="pricing.md" /%}
    {% file name="scope-rules.md" /%}
    {% file name="quality-checklist.md" /%}
  {% /folder %}
  {% folder name="samples" %}
    {% file name="acme-sow.md" /%}
    {% file name="globex-sow.md" /%}
  {% /folder %}
{% /folder %}
{% /files %}

---

## How Streams improve over time

Every time Q completes a task from a Stream, you have a chance to make the Stream better. If something in the output wasn't quite right, you can update the playbook or specs to address it. Maybe a section was too long, or the tone was off, or a pricing rule was missed.

This is the core idea: each piece of feedback can make its way back into the Stream. Update a spec to clarify a rule. Add a step to the playbook. Drop in a new sample that shows the right approach. The next time Q runs a task from that Stream, it follows the updated instructions.

Over time, the outputs become more consistent and more accurate. The playbook, specs, and samples get more precise with each iteration, and Q follows the updated versions every time. You're building a set of instructions that capture how you do this work. And those instructions belong to you.

---

## How context works

When Q starts a task, it reads the Stream's playbook, specs, and samples to understand how the work should be done. Your second SOW benefits from everything you set up for the first one. Your tenth weekly update follows the same structure as the ninth, without you repeating a thing.

This is different from a chat conversation where context fades as the thread gets longer. The playbook gives Q the steps. The specs give it the rules and details. The samples give it concrete examples to reference. All of this is available every time, because it's stored in files.

You can stop a task, update a spec, and restart. Q picks up the new instructions immediately. You're not re-explaining something you said twenty messages ago. You're editing a file.

---

## Under the hood

A Stream is a directory of files. The playbook and specs are plain markdown. Samples are your past work, in whatever format you have it. You can open the directory in a file browser, track changes in git, or copy it to onboard a colleague.
