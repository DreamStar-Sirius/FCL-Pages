-- ============================================================
-- FCL 头像上传修复：创建 avatars 存储桶 + 配置访问策略
-- ------------------------------------------------------------
-- 用法：登录 Supabase 控制台 → 左侧 SQL Editor → New query
--       粘贴本文件全部内容 → 点 Run
-- ------------------------------------------------------------
-- 背景：站点头像上传报 "TypeError: Failed to fetch"，
--       实测 storage API 返回 {"code":"NoSuchBucket"}，
--       即 avatars 存储桶从未创建过。
-- ============================================================

-- 1) 创建 avatars 存储桶（public = 可通过公开 URL 直接读取头像）
--    file_size_limit 设 2MB（前端已压缩到 ~50KB，留足余量）
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/webp', 'image/jpeg', 'image/png', 'image/gif', 'image/bmp']
)
on conflict (id) do update
  set public             = true,
      file_size_limit    = 2097152,
      allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png', 'image/gif', 'image/bmp'];

-- 2) 清理可能残留的同名策略，保证脚本可重复执行
drop policy if exists "avatars_public_read"   on storage.objects;
drop policy if exists "avatars_user_insert"   on storage.objects;
drop policy if exists "avatars_user_update"   on storage.objects;
drop policy if exists "avatars_user_delete"   on storage.objects;

-- 3) 任何人都可以读取头像（头像需要在页面上公开显示）
create policy "avatars_public_read"
on storage.objects for select
using ( bucket_id = 'avatars' );

-- 4) 登录用户只能上传到「以自己 user id 命名的文件夹」下
--    前端路径规则为 `${user.id}/${timestamp}.webp`，与此策略对应
create policy "avatars_user_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 5) 登录用户只能覆盖自己文件夹下的文件（upsert 需要 update 权限）
create policy "avatars_user_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 6) 登录用户只能删除自己文件夹下的旧头像
create policy "avatars_user_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================
-- 验证：执行后应看到 avatars 桶存在且 public = true
-- ============================================================
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'avatars';

-- 验证策略是否创建成功（应返回 4 行）
select policyname, cmd
from pg_policies
where schemaname = 'storage'
  and tablename  = 'objects'
  and policyname like 'avatars_%'
order by policyname;
